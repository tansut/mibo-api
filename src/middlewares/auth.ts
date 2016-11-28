import * as stream from 'stream';
import * as console from 'console';
import * as express from "express";
import Middleware from '../lib/middleware';
import { PermissionError } from '../lib/http.errors';

export var Auth: AuthMiddleware;

// export function Authenticated(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
//     let originalMethod = descriptor.value;

//     descriptor.value = function (...args: any[]) {
//         Auth.Authenticated.apply(Auth, args);
//         let result = originalMethod.apply(this, args);
//         console.log("The return value is: ");
//         return result;
//     };

//     return descriptor;
// }

export default class AuthMiddleware extends Middleware {

    private SetUser(req, res, next) {
        req.user = 111;
        next();
    }

    Force(req, res, next) {
        if (!req.user)
            next(new PermissionError())
        else next();
    }

    constructor(app: express.Application) {
        super(app);
        Auth = this;
        app.use(this.SetUser.bind(this))
    }
}