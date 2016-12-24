import { SignupModel } from '../../models/account';
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
        emailErr: 'emailErr',
        passEmpty: 'passEmpty',
        success: 'success',
        error: 'error'
    }

    @Auth.Anonymous()
    renderNewAccountRoute() {
        PageRenderer.renderPage(this.res, 'account/newaccount', 'Register Now', 'init', null);
    }

    @Auth.Anonymous()
    createNewAccountRoute() {
        var email = this.req.body.email;
        var password = this.req.body.password;
        if (validator.isEmpty(email) || !validator.isEmail(email)) {
            PageRenderer.renderPage(this.res, 'account/newaccount', 'Registeration Now', this.errStatus.emailErr, null);
        } else if (validator.isEmpty(password)) {
            PageRenderer.renderPage(this.res, 'account/newaccount', 'Register Now', this.errStatus.passEmpty, null);
        } else {
            var newUser = <SignupModel>{
                email: email,
                password: password
            }
            var userRoute = new UserRoute();
            userRoute.create(newUser).then(() => {
                PageRenderer.renderPage(this.res, 'account/newaccount', 'Registeration Complete', this.errStatus.success, null);
            }).catch((err) => {
                console.log(err);
                PageRenderer.renderPage(this.res, 'account/newaccount', 'Registeration Error', this.errStatus.error, null);
            })
        }
    }

    static SetRoutes(router: express.Router) {
        router.get("/account/new", Route.BindRequest('renderNewAccountRoute'));
        router.post("/account/new", Route.BindRequest('createNewAccountRoute'));
    }

}


