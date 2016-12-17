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


class Route extends ApiBase {

    errStatus = {
        emailErr: 'emailErr',
        passEmpty: 'passEmpty',
        success: 'success'
    }

    renderNewAccountRoute(req: http.ApiRequest, res: express.Response, next: Function) {
        res.render('account/newaccount', {
            title: 'Register Now',
            status: 'init'
        });
    }

    createNewAccountRoute(req: http.ApiRequest, res: express.Response, next: Function) {
        var email = req.body.email;
        var password = req.body.password;
        if (validator.isEmpty(email) || !validator.isEmail(email)) {
            res.render('account/newaccount', {
                title: 'Register Now',
                status: this.errStatus.emailErr
            });
        } else if (validator.isEmpty(password)) {
            res.render('account/newaccount', {
                title: 'Register Now',
                status: this.errStatus.passEmpty
            });
        } else {
            var newUser = <SignupModel>{
                email: email,
                password: password
            }
            var userRoute = new UserRoute();
            userRoute.create(newUser).then(() => {
                res.render('account/newaccount', {
                    title: 'Registeration Complete',
                    status: this.errStatus.success
                });
            });
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

