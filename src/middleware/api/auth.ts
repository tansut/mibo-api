import * as express from "express";
import Middleware from "./base";
import * as requests from '../../lib/api.request';
import * as errors from '../../lib/http.errors';

export var auth: AuthMiddleware;

class AuthMiddleware extends Middleware {

    private loadUser(req: requests.ApiRequest, res: express.Response, next: Function) {
        //req.user = "foo";
        next();
    }

    public force(req: requests.ApiRequest, res: express.Response, next: Function, roles?: Array<string>) {
        if (!req.user)
            next(new errors.PermissionError());
        else next();
    }

    constructor(app: express.Application) {
        super(app);
        app.use(this.loadUser.bind(this));
    }
}


export default (app: express.Application) => auth = new AuthMiddleware(app);
