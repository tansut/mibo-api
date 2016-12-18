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
        noPosition: 'noPosition',
        success: 'success'
    }
    downloadLink: string = 'http://#downloadLink';

    renderCoachSignup(req: http.ApiRequest, res: express.Response, next: Function) {
        res.render('account/newcoach', {
            title: 'Coach Application',
            status: 'init',
            downloadLink: this.downloadLink
        });
    }

    coachSignupRoute(req: http.ApiRequest, res: express.Response, next: Function) {
        var email = req.body.email;
        var password = req.body.password;
        var message = req.body.message;
        var position = req.body.position;
        var linkedIn = req.body.linkedin;

        if (validator.isEmpty(email) || !validator.isEmail(email)) {
            res.render('account/newcoach', {
                title: 'Coach Application',
                status: this.errStatus.emailErr,
                downloadLink: this.downloadLink
            });
        } else if (validator.isEmpty(password)) {
            res.render('account/newcoach', {
                title: 'Coach Application',
                status: this.errStatus.passEmpty,
                downloadLink: this.downloadLink
            });
        } else if (position == '-- Apply As --') {
            res.render('account/newcoach', {
                title: 'Coach Application',
                status: this.errStatus.noPosition,
                downloadLink: this.downloadLink
            });
        } else {
            var newCoach = <SignupModel>{
                email: email,
                password: password
            }
            var data = {
                message: message,
                position: position,
                email: email,
                linkedIn: linkedIn
            }
            var userRoute = new UserRoute();
            userRoute.createCoach(newCoach, data).then(() => {
                res.render('account/newcoach', {
                    title: 'Application Complete',
                    status: this.errStatus.success,
                    downloadLink: this.downloadLink
                });
            });
        }
    }

    constructor(router?: express.Router) {
        super(router);
        this.router && this.router.get("/coach/apply", this.renderCoachSignup.bind(this));
        this.router && this.router.post("/coach/apply", this.coachSignupRoute.bind(this));
    }
}

export let route: Route;
export function init(router?: express.Router) { route = new Route(router) };

