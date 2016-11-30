import { ObjectID } from 'mongodb';
import { request } from 'https';
import * as stream from 'stream';
import * as express from "express";
import { auth } from '../../middleware/api/auth';
import * as mongoose from 'mongoose';
import ApiRoute from './base';
import * as requests from '../../lib/api.request';
import * as _ from 'lodash';

export interface crudRouteOptions {
    create?: boolean,
    delete?: boolean,
    update?: boolean,
    retrieve?: boolean,
    query?: boolean
}

export default class CrudRoute<T extends mongoose.Document> extends ApiRoute {

    get excludedFromResponse(): string {
        return '-__v'
    }



    private toObjectId(id: string): mongoose.Types.ObjectId {
        return mongoose.Types.ObjectId.createFromHexString(id)
    }

    retrieve(id: string | ObjectID, lean: boolean = true) {
        var res = this.model.findById(id).select(this.excludedFromResponse);
        return lean ? res.lean() : res;
    }

    protected retrieveRoute(req: requests.ApiRequest, res: express.Response, next: Function) {
        var dbId = this.toObjectId(req.params._id);
        this.retrieve(dbId).then((result) => { result ? res.send(result) : res.sendStatus(404) }, (err) => next(err));
    }

    create(item: T) {
        return this.model.create(item);
    }

    protected createRoute(req: requests.ApiRequest, res: express.Response, next: Function) {
        var itemToAdd = req.body;
        this.create(itemToAdd).then((result) => {
            res.send({
                _id: result._id
            })
        }, (err) => next(err));
    }

    delete(id: string | ObjectID) {
        return this.retrieve(id, false).then((item) => {
            return item ? item.remove() : null;
        })
    }

    deleteRoute(req: requests.ApiRequest, res: express.Response, next: Function) {
        var dbId = this.toObjectId(req.params._id);
        this.delete(dbId).then((result) => { result ? res.sendStatus(200) : res.sendStatus(404) }, (err) => next(err));
    }

    update(id: string | ObjectID, values: any) {
        return this.retrieve(id, false).then((item) => {
            return item ? _.extend(item, values).save() : null;
        })
    }

    updateRoute(req: requests.ApiRequest, res: express.Response, next: Function) {
        var dbId = this.toObjectId(req.params._id);
        var updateValues = req.body;
        this.update(dbId, updateValues).then((result) => { result ? res.send(200) : res.sendStatus(404) }, (err) => next(err));
    }

    protected generateRetrieveRoute() {
        this.router.get(this.url.concat('/:_id'), this.retrieveRoute.bind(this));
    }

    protected generateCreateRoute() {
        this.router.post(this.url, this.authenticate.bind(this), this.createRoute.bind(this));
    }

    protected generateDeleteRoute() {
        this.router.delete(this.url.concat('/:_id'), this.deleteRoute.bind(this));
    }

    protected generateUpdateRoute() {
        this.router.put(this.url.concat('/:_id'), this.updateRoute.bind(this));
    }

    protected generateListRoute() {

    }
    protected generateRoutes() {
        this.generateRetrieveRoute();
        this.generateCreateRoute();
        this.generateListRoute();
        this.generateDeleteRoute();
        this.generateUpdateRoute();
    }

    constructor(public router: express.Router, public model: mongoose.Model<T>, protected url: string, protected options?: crudRouteOptions) {
        super(router);
        this.generateRoutes();
    }
}