import * as http from '../lib/http';
import * as express from "express";
import { auth } from '../middleware/api/auth';
import { ObjectID } from 'mongodb';
import { Auth } from '../lib/common';
import 'reflect-metadata';

export enum ResponseStatus {
    success = 0,
    warning = 1,
    error = 2
}

export interface ApiResponse {
    $status: ResponseStatus,
    result?: any;
}

export interface ICredentialIdentifier {
    _id: string;
    roles: Array<string>;
}

export interface IRequestParams {
    req: http.ApiRequest;
    res: express.Response;
    next: Function;
}

export default class BaseRouter {
    protected req: http.ApiRequest;
    protected res: express.Response;
    protected next: Function;

    protected constructorParams: any;

    forceAuthenticate(req, res, next) {
        return auth.force(req, res, next);
    }

    protected static BindRequest(method: string) {

        var self = this;

        return (req, res, next) => BaseRouter.CreateRouterInstance(req, res, next, self, method);
    }

    protected static AuthenticateRequest() {
        var self = this;
        return (req, res, next) => BaseRouter.CreateRouterInstance(req, res, next, self, 'forceAuthenticate');
    }



    protected static CreateRouterInstance(req: http.ApiRequest, res: express.Response, next: Function, constructor: typeof BaseRouter, method: string): BaseRouter {
        var instance = new constructor({
            req: req,
            res: res,
            next: next
        });

        let handler = instance[method];
        var anonymous = Auth.GetAnonymous(handler);

        if (!anonymous && !req.user)
            return next(new http.PermissionError());


        var promise = handler.apply(instance);

        if (promise && promise instanceof Promise) {
            promise.catch((err) => {
                next(err);
            });
        }

        return instance;
    }

    validateOwnership(ownerOfResource: string | ObjectID) {
        return new Promise((resolve, reject) => {
            var user = this.req.user;
            var id = user._id.toString() || user._id;
            var ownerId = ownerOfResource.toString() || ownerOfResource;
            if (ownerId == id)
                resolve();
            else if (user.roles.indexOf('admin') >= 0)
                resolve();
            else reject(new http.PermissionError());
        });
    }

    constructor(reqParams?: IRequestParams) {
        if (reqParams) {
            this.req = reqParams.req;
            this.res = reqParams.res;
            this.next = reqParams.next;
        }
        this.constructorParams = reqParams;
    }
}