import { UserModel } from '../../db/models/user';
import ApiBase from './base';
import * as express from "express";
import * as http from '../../lib/http';
import * as validator from 'validator';
import * as common from '../../lib/common';
import * as moment from 'moment';
import * as bcrypt from 'bcryptjs';
import UserRoute from '../api/user';
import PageRenderer from './renderer';


class Route extends ApiBase {

    errStatus = {
        notFound: 'notFound',
        expired: 'expired',
        noPassMatch: 'noPassMatch',
        success: 'success'
    }


    renderGetNewPass(req: http.ApiRequest, res: express.Response, next: Function) {
        var resetToken = req.query.token;
        if (typeof resetToken === 'undefined') {
            res.sendStatus(401);
        }
        PageRenderer.renderPage(res, 'account/resetpassword', 'MiBo Password Reset', 'init', resetToken);
    }

    renderAndReset(req: http.ApiRequest, res: express.Response, next: Function) {
        var resetToken = req.body.resetToken;
        var newPass1 = req.body.newPass1;
        var newPass2 = req.body.newPass2;

        if (newPass1 != newPass2 || validator.isEmpty(newPass1) || validator.isEmpty(newPass2)) {
            PageRenderer.renderPage(res, 'account/resetpassword', 'MiBo Password Reset', this.errStatus.noPassMatch, resetToken);
        } else {
            UserModel.findOne().where('resetToken', resetToken).then((user) => {
                if (!user) {
                    PageRenderer.renderPage(res, 'account/resetpassword', 'MiBo Password Reset', this.errStatus.notFound, resetToken);
                    return Promise.reject(new http.NotFoundError())
                }
                if (moment.utc().toDate() > user.resetTokenValid) {
                    PageRenderer.renderPage(res, 'account/resetpassword', 'MiBo Password Reset', this.errStatus.expired, resetToken);
                    return Promise.reject(new http.ValidationError('Token Expired'));
                }
                user.resetToken = null;
                user.resetTokenValid = null;

                var newPass = newPass2;
                var passwordSalt = bcrypt.genSaltSync(10);
                var hash = bcrypt.hashSync(newPass, passwordSalt);
                user.password = hash;
                return user.save().then((user) => {
                    PageRenderer.renderPage(res, 'account/resetpassword', 'Mibo Password Reset', this.errStatus.success, resetToken);
                }).catch((err) => next(err));
            }).catch((err) => next(err));
        }
    }



    constructor(router?: express.Router) {
        super(router);
        this.router && this.router.get("/account/resetpassword*", this.renderGetNewPass.bind(this));
        this.router && this.router.post("/account/resetpassword", this.renderAndReset.bind(this));
    }
}

export let route: Route;
export function init(router?: express.Router) { route = new Route(router) };

