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
import PageRenderer from './renderer';



class Route extends ApiBase {

    errStatus = {
        emailErr: 'emailErr',
        passEmpty: 'passEmpty',
        noPosition: 'noPosition',
        nameEmpty: 'nameEmpty',
        success: 'success'
    }

    renderCoachSignup(req: http.ApiRequest, res: express.Response, next: Function) {
        PageRenderer.renderPage(res, 'account/newcoach', 'Coach Application', 'init');
    }

    coachSignupRoute(req: http.ApiRequest, res: express.Response, next: Function) {
        var data = {
            message: req.body.message,
            position: req.body.position,
            email: req.body.email,
            linkedIn: req.body.linkedIn,
            fullName: req.body.fullName
        }

        if (validator.isEmpty(data.email) || !validator.isEmail(data.email)) {
            PageRenderer.renderPage(res, 'account/newcoach', 'Coach Application', this.errStatus.emailErr, null);
        } else if (validator.isEmpty(data.fullName)) {
            PageRenderer.renderPage(res, 'account/newcoach', 'Coach Application', this.errStatus.nameEmpty, null);
        } else if (data.position == '-- Apply As --') {
            PageRenderer.renderPage(res, 'account/newcoach', 'Coach Application', this.errStatus.noPosition, null);
        } else {
            PageRenderer.renderPage(res, 'account/newcoach', 'Coach Application', this.errStatus.success, null);
            emailmanager.send('hello@wellbit.io', 'Mibo - New Coach Application', 'application.ejs', {
                title: 'New Application',
                position: data.position,
                message: data.message,
                email: data.email,
                linkedIn: data.linkedIn,
                fullName: data.fullName
            }).then(() => {
                console.log('Successful.');
            }).catch(err => console.log(err));
            emailmanager.send(data.email, 'Your Application to Mibo', 'newcoach.ejs', {
                title: 'Your Application',
                position: data.position
            }).then(() => {
                console.log('Successful.');
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

