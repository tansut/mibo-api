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
import emailmanager from '../../lib/email';



class Route extends ApiBase {

    errStatus = {
        emailErr: 'emailErr',
        passEmpty: 'passEmpty',
        noPosition: 'noPosition',
        nameEmpty: 'nameEmpty',
        success: 'success'
    }

    renderCoachSignup(req: http.ApiRequest, res: express.Response, next: Function) {
        res.render('account/newcoach', {
            title: 'Coach Application',
            status: 'init',
        });
    }

    coachSignupRoute(req: http.ApiRequest, res: express.Response, next: Function) {
        var email = req.body.email;
        var message = req.body.message;
        var position = req.body.position;
        var linkedIn = req.body.linkedin;
        var fullName = req.body.fullName;

        if (validator.isEmpty(email) || !validator.isEmail(email)) {
            res.render('account/newcoach', {
                title: 'Coach Application',
                status: this.errStatus.emailErr,
            });
        } else if (validator.isEmpty(fullName)) {
            res.render('account/newcoach', {
                title: 'Coach Application',
                status: this.errStatus.nameEmpty,
            });
        } else if (position == '-- Apply As --') {
            res.render('account/newcoach', {
                title: 'Coach Application',
                status: this.errStatus.noPosition,
            });
        } else {
            var data = {
                message: message,
                position: position,
                email: email,
                linkedIn: linkedIn,
                fullName: fullName
            }
            // emailmanager.send(email, 'Your Application to Mibo', 'newcoach.ejs', {
            //     title: 'Your Application',
            //     position: data.position
            // }).then(() => {
            emailmanager.send('hello@wellbit.io', 'Mibo - New Coach Application', 'application.ejs', {
                title: 'New Application',
                position: data.position,
                message: data.message,
                email: data.email,
                linkedIn: data.linkedIn,
                fullName: data.fullName
            }).then(() => {
                res.render('account/newcoach', {
                    title: 'Coach Application',
                    status: this.errStatus.success,

                });
            }).catch(err => console.log(err));
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

