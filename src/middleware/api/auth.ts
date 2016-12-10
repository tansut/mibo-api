import * as express from "express";
import * as moment from 'moment';
import Middleware from "./base";
import * as http from '../../lib/http';
import { UserModel } from '../../db/models/user';
import * as authCntroller from '../../lib/authorizationToken';


export var auth: AuthMiddleware;

class AuthMiddleware extends Middleware {

    private loadUser(req: http.ApiRequest, res: express.Response, next: Function) {
        var authHeader = req.header("Authorization");
        if (!authHeader) {
            next();
            return;
        }
        try {
            var accessToken = authCntroller.default.decryptAccessToken(authHeader);
            this.validateAccessToken(accessToken, req, next);
        } catch (e) {
            next();
        }

    }

    private validateAccessToken(accessToken: authCntroller.IAccessTokenData, req: http.ApiRequest, next: Function) {
        if (moment(accessToken.expiration_time).isSameOrAfter(moment().utc())) {
            UserModel.findById(accessToken.userId).exec((err, res) => {
                if (err) {
                    next();
                    return;
                } else if (!res) {
                    next();
                    return;
                } else {
                    req.user = res;
                    next();
                }

            });
        } else {
            next();
        }
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
