import { UserModel } from '../../db/models/user';
import WebBase from './base';
import * as express from "express";
import * as http from '../../lib/http';
import * as validator from 'validator';
import * as common from '../../lib/common';
import * as moment from 'moment';
import * as bcrypt from 'bcryptjs';
import UserRoute from '../api/user';
import PageRenderer from './renderer';
import { Auth } from '../../lib/common';


export default class Route extends WebBase {

    errStatus = {
        notFound: 'notFound',
        expired: 'expired',
        noPassMatch: 'noPassMatch',
        success: 'success'
    }

    @Auth.Anonymous()
    renderGetNewPassRoute() {
        var resetToken = this.req.query.token;
        if (typeof resetToken === 'undefined') {
            this.res.sendStatus(401);
        }
        PageRenderer.renderPage(this.res, 'account/resetpassword', 'MiBo Password Reset', 'init', resetToken);
    }

    @Auth.Anonymous()
    renderAndResetRoute() {
        var resetToken = this.req.body.resetToken;
        var newPass1 = this.req.body.newPass1;
        var newPass2 = this.req.body.newPass2;

        if (newPass1 != newPass2 || validator.isEmpty(newPass1) || validator.isEmpty(newPass2)) {
            PageRenderer.renderPage(this.res, 'account/resetpassword', 'MiBo Password Reset', this.errStatus.noPassMatch, resetToken);
        } else {
            UserModel.findOne().where('resetToken', resetToken).then((user) => {
                if (!user) {
                    PageRenderer.renderPage(this.res, 'account/resetpassword', 'MiBo Password Reset', this.errStatus.notFound, resetToken);
                    return Promise.reject(new http.NotFoundError())
                }
                if (moment.utc().toDate() > user.resetTokenValid) {
                    PageRenderer.renderPage(this.res, 'account/resetpassword', 'MiBo Password Reset', this.errStatus.expired, resetToken);
                    return Promise.reject(new http.ValidationError('Token Expired'));
                }
                user.resetToken = null;
                user.resetTokenValid = null;

                var newPass = newPass2;
                var passwordSalt = bcrypt.genSaltSync(10);
                var hash = bcrypt.hashSync(newPass, passwordSalt);
                user.password = hash;
                return user.save().then((user) => {
                    PageRenderer.renderPage(this.res, 'account/resetpassword', 'Mibo Password Reset', this.errStatus.success, resetToken);
                })
            });
        }
    }

    static SetRoutes(router: express.Router) {
        router.get("/account/resetpassword*", Route.BindRequest('renderGetNewPassRoute'));
        router.post("/account/resetpassword", Route.BindRequest('renderAndResetRoute'));
    }


}


