import { ObjectID } from 'mongodb';
import { request } from 'https';
import * as stream from 'stream';
import * as express from "express";
import { auth } from '../../middleware/api/auth';
import * as mongoose from 'mongoose';
import ApiRoute from './base';
import { ICredentialIdentifier, IRequestParams } from './base';
import * as http from '../../lib/http';
import * as _ from 'lodash';
import { IDBDocument } from '../../db';

export interface crudRouteOptions {
    create?: boolean,
    delete?: boolean,
    update?: boolean,
    retrieve?: boolean,
    query?: boolean
}

export enum CrudOperation {
    read, create, update, delete
}

export interface RetrieveOptions {
    lean?: boolean,
    fields?: string;
    toClient?: boolean;
}

export default class CrudRoute<T extends IDBDocument> extends ApiRoute {

    validateDocumentOwnership(doc: T) {
        if (doc._meta.owner)
            return this.validateOwnership(doc._meta.owner);
        else return this.validateOwnership(doc._id);
    }

    private toObjectId(id: string): mongoose.Types.ObjectId {
        return mongoose.Types.ObjectId.createFromHexString(id)
    }

    retrieve(id: string | ObjectID, options?: RetrieveOptions): Promise<T> {
        options = options || {};
        var baseQuery = this.model.findById(id);
        if (options.lean)
            baseQuery = baseQuery.lean();
        let select = '';
        if (options.fields)
            select = select.concat(' ', options.fields);
        if (select != '')
            baseQuery = baseQuery.select(select);
        return baseQuery.then((doc: T) => {
            if (!doc) return Promise.reject(new http.NotFoundError());
            return this.validateDocumentOwnership(doc).then(() => {
                if (options.toClient)
                    return doc.toClient()
                else return doc;
            });
        });
    }

    protected retrieveRoute(req: http.ApiRequest, res: express.Response, next: Function) {
        var dbId = this.toObjectId(req.params._id);
        this.retrieve(dbId).then((result) => res.send(result.toClient()), (err) => next(err));
    }

    create(model: any): Promise<T> {
        return new Promise((resolve, reject) => {
            reject();
        });
    }

    protected createRoute() {
        var itemToAdd = this.req.body;
        return this.create(itemToAdd).then((result) => {
            this.res.send({
                _id: result._id.toString()
            })
        });
    }

    delete(doc: T) {
        return doc.remove();
    }

    deleteRoute(req: http.ApiRequest, res: express.Response, next: Function) {
        var dbId = this.toObjectId(req.params._id);
        var deleteResult = this.retrieve(dbId, { lean: true }).then((doc) => this.delete(doc));
        deleteResult.then((result) => res.sendStatus(200), (err) => next(err));
    }

    update(doc: T, updateValues: any) {
        return new Promise((resolve, reject) => {
            reject();
        });
    }

    updateRoute(req: http.ApiRequest, res: express.Response, next: Function) {
        var dbId = this.toObjectId(req.params._id);
        var updateValues = req.body;
        var updateResult = this.retrieve(dbId, { lean: true }).then((doc) => this.update(doc, updateValues));
        updateResult.then((result) => { res.send(result || 200) }, (err) => next(err));
    }

    query(req: http.ApiRequest, res: express.Response, next: Function) {
        res.sendStatus(200);
    }

    protected static generateCreateRoute(url: string, router: express.Router) {
        router.post(url, this.AuthenticateRequest, this.BindRequest('createRoute'));
    }
    protected static generateUpdateRoute(url: string, router: express.Router) {
        router.get(url.concat('/:_id'), this.AuthenticateRequest, this.BindRequest('updateRoute'));
    }
    protected static generateDeleteRoute(url: string, router: express.Router) {
        router.delete(url.concat('/:_id'), this.AuthenticateRequest, this.BindRequest('deleteRoute'));
    }
    protected static generateQueryRoute(url: string, router: express.Router) {
        router.get(url.concat('/query'), this.BindRequest('query'));
    }
    protected static generateRetrieveRoute(url: string, router: express.Router) {
        router.get(url.concat('/:_id'), this.BindRequest('retrieveRoute'));
    }

    protected static SetCrudRoutes(url: string, router: express.Router, routeOptions?: crudRouteOptions) {
        routeOptions = routeOptions || {
            create: true,
            delete: true,
            retrieve: true,
            query: true,
            update: true
        }

        routeOptions.create && this.generateCreateRoute(url, router);
        routeOptions.update && this.generateUpdateRoute(url, router);
        routeOptions.delete && this.generateDeleteRoute(url, router);
        routeOptions.query && this.generateDeleteRoute(url, router);
        routeOptions.retrieve && this.generateRetrieveRoute(url, router);

    }

    constructor(reqParams: IRequestParams, public model: mongoose.Model<T>) {
        super(reqParams);
    }
}