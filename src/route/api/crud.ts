import { ObjectID } from 'mongodb';
import { request } from 'https';
import * as stream from 'stream';
import * as express from "express";
import { auth } from '../../middleware/api/auth';
import * as mongoose from 'mongoose';
import ApiRoute from './base';
import * as http from '../../lib/http';
import * as _ from 'lodash';
import { IDBDocument } from '../../db'

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
    ensurePermission(doc: T, operation?: CrudOperation) {
        return new Promise<T>((resolve, reject) => {
            resolve(doc);
        });
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
            return this.ensurePermission(doc, CrudOperation.read).then(() => {
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

    create(doc: T) {
        return this.model.create(doc);
    }

    protected createRoute(req: http.ApiRequest, res: express.Response, next: Function) {
        var itemToAdd = req.body;
        this.create(itemToAdd).then((result) => {
            res.send({
                _id: result._id
            })
        }, (err) => next(err));
    }

    delete(id: string | ObjectID) {
        return this.retrieve(id, { lean: true }).then((doc) => this.ensurePermission(doc, CrudOperation.delete).then((doc) => doc.remove()));
    }

    deleteRoute(req: http.ApiRequest, res: express.Response, next: Function) {
        var dbId = this.toObjectId(req.params._id);
        this.delete(dbId).then((result) => res.sendStatus(200), (err) => next(err));
    }

    update(id: string | ObjectID, values: any) {
        return this.retrieve(id, { lean: true }).then((item) => {
            return this.retrieve(id, { lean: true }).then((doc) => this.ensurePermission(doc, CrudOperation.update).then((doc) => _.extend(item, values).save()));
        })
    }

    updateRoute(req: http.ApiRequest, res: express.Response, next: Function) {
        var dbId = this.toObjectId(req.params._id);
        var updateValues = req.body;
        this.update(dbId, updateValues).then((result) => { res.send(200) }, (err) => next(err));
    }

    query(req: http.ApiRequest, res: express.Response, next: Function) {
        res.sendStatus(200);
    }

    protected generateRetrieveRoute() {
        this.router.get(this.url.concat('/:_id'), this.retrieveRoute.bind(this));
    }

    protected generateCreateRoute() {
        this.router.post(this.url, this.authenticate.bind(this), this.createRoute.bind(this));
    }

    protected generateDeleteRoute() {
        this.router.delete(this.url.concat('/:_id'), this.authenticate.bind(this), this.deleteRoute.bind(this));
    }

    protected generateUpdateRoute() {
        this.router.put(this.url.concat('/:_id'), this.authenticate.bind(this), this.updateRoute.bind(this));
    }

    protected generateQueryRoute() {
        this.router.get(this.url.concat('/query'), this.query.bind(this));
    }

    protected generateRoutes() {
        this.routeOptions.retrieve && this.generateRetrieveRoute();
        this.routeOptions.create && this.generateCreateRoute();
        this.routeOptions.query && this.generateQueryRoute();
        this.routeOptions.delete && this.generateDeleteRoute();
        this.routeOptions.update && this.generateUpdateRoute();
    }

    constructor(public router: express.Router,
        public model: mongoose.Model<T>,
        protected url: string, protected routeOptions?: crudRouteOptions) {
        super(router);
        this.routeOptions = this.routeOptions || {
            create: true,
            delete: true,
            retrieve: true,
            query: true,
            update: true
        }
        this.generateRoutes();
    }
}