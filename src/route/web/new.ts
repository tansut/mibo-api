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
        notFound: 'notFound',
        expired: 'expired',
        noPassMatch: 'noPassMatch',
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
        var pass1 = req.body.pass1;
        var pass2 = req.body.pass2;
        if (validator.isEmpty(email) || !validator.isEmail(email)) {
            res.render('account/newaccount', {
                title: 'Register Now',
                status: this.errStatus.notFound
            });
        } else if (pass1 != pass2 || validator.isEmpty(pass1) || validator.isEmpty(pass2)) {
            res.render('account/newaccount', {
                title: 'Register Now',
                status: this.errStatus.noPassMatch
            });
        } else {
            var newUser = <SignupModel>{
                email: email,
                password: pass2
            }
            var userRoute = new UserRoute();
            userRoute.create(newUser);
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

