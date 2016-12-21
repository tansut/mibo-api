import { SignupModel } from '../../models/account';
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
        emailErr: 'emailErr',
        passEmpty: 'passEmpty',
        success: 'success',
        error: 'error'
    }

    renderNewAccountRoute(req: http.ApiRequest, res: express.Response, next: Function) {
        PageRenderer.renderPage(res, 'account/newaccount', 'Register Now', 'init', null);
    }

    createNewAccountRoute(req: http.ApiRequest, res: express.Response, next: Function) {
        var email = req.body.email;
        var password = req.body.password;
        if (validator.isEmpty(email) || !validator.isEmail(email)) {
            PageRenderer.renderPage(res, 'account/newaccount', 'Registeration Now', this.errStatus.emailErr, null);
        } else if (validator.isEmpty(password)) {
            PageRenderer.renderPage(res, 'account/newaccount', 'Register Now', this.errStatus.passEmpty, null);
        } else {
            var newUser = <SignupModel>{
                email: email,
                password: password
            }
            var userRoute = new UserRoute();
            userRoute.create(newUser).then(() => {
                PageRenderer.renderPage(res, 'account/newaccount', 'Registeration Complete', this.errStatus.success, null);
            }).catch((err) => {
                console.log(err);
                PageRenderer.renderPage(res, 'account/newaccount', 'Registeration Error', this.errStatus.error, null);
            })
        }
    }

    constructor(router?: express.Router) {
        super(router);
        this.router && this.router.get("/account/new", this.renderNewAccountRoute.bind(this));
        this.router && this.router.post("/account/new", this.createNewAccountRoute.bind(this));
    }
}

export let route: Route;
export function init(router?: express.Router) { route = new Route(router) };

