import * as express from "express";
import * as moment from 'moment';
import Middleware from "./base";
import * as http from '../../lib/http';
import { UserModel } from '../../db/models/user';
import * as authCntroller from '../../lib/authorizationToken';


export var auth: AuthMiddleware;

class AuthMiddleware extends Middleware {

    private tryLoadUser(req: http.ApiRequest, res: express.Response, next: Function) {

        var authHeader = req.header("Authorization");
        if (!authHeader) {
            return next();
        }
        try {
            var accessToken = authCntroller.default.decryptAccessToken(authHeader);
            this.validateAccessToken(accessToken).then((user) => {
                req.user = user;
                return next();
            }).catch((err) => next(err));
        } catch (e) {
            next(e);
        }
    }

    private validateAccessToken(accessToken: authCntroller.IAccessTokenData) {
        return new Promise((resolve, reject) => {
            if (moment(accessToken.expiration_time).utc().isSameOrAfter(moment().utc())) {
                return UserModel.findById(accessToken.userId).lean().then((user) => {
                    return user ? resolve(user) : Promise.reject(new http.NotFoundError);
                })
            } else reject(new http.PermissionError('tokenexpire'));
        });
    }

    public force(req: http.ApiRequest, res: express.Response, next: Function, roles?: Array<string>) {
        if (!req.user)
            next(new http.PermissionError());
        else next();
    }

    constructor(app: express.Application) {
        super(app);
        app.use(this.tryLoadUser.bind(this));
    }
}


export default (app: express.Application) => auth = new AuthMiddleware(app);
