import * as express from "express";
import Middleware from "./base";
import * as http from '../../lib/http';

export var auth: AuthMiddleware;

class AuthMiddleware extends Middleware {

    private loadUser(req: http.ApiRequest, res: express.Response, next: Function) {
        //req.user = "foo";
        next();
    }

    public force(req: http.ApiRequest, res: express.Response, next: Function, roles?: Array<string>) {
        if (!req.user)
            next(new http.PermissionError());
        else next();
    }

    constructor(app: express.Application) {
        super(app);
        app.use(this.loadUser.bind(this));
    }
}


export default (app: express.Application) => auth = new AuthMiddleware(app);
