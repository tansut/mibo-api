import * as http from '../../lib/http';
import * as express from "express";
import { auth } from '../../middleware/api/auth';
import { ObjectID } from 'mongodb';

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

export default class ApiRoute {
    protected req: http.ApiRequest;
    protected res: express.Response;
    protected next: Function;

    forceAuthenticate(req, res, next) {
        return auth.force(req, res, next);
    }

    protected static BindRequest(method: string) {
        var self = this;
        return (req, res, next) => ApiRoute.CreateRouterInstance(req, res, next, self, method);
    }

    protected static CreateRouterInstance(req: http.ApiRequest, res: express.Response, next: Function, constructor: typeof ApiRoute, method: string): ApiRoute {
        var instance = new constructor();
        instance.req = req;
        instance.res = res;
        instance.next = next;
        let handler = instance[method];
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
            if (ownerOfResource == id)
                resolve();
            else if (user.roles.indexOf('admin') >= 0)
                resolve();
            else reject(new http.PermissionError());

        });
    }

    constructor() {

    }
}