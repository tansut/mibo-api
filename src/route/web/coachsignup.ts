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
import emailmanager from '../../lib/email';
import PageRenderer from './renderer';
import { Auth } from '../../lib/common';



export default class Route extends WebBase {

    errStatus = {
        emailErr: 'emailErr',
        passEmpty: 'passEmpty',
        noPosition: 'noPosition',
        nameEmpty: 'nameEmpty',
        success: 'success'
    }

    @Auth.Anonymous()
    renderCoachSignupRoute() {
        PageRenderer.renderPage(this.res, 'account/newcoach', 'Coach Application', 'init');
    }

    @Auth.Anonymous()
    coachSignupRoute() {
        var data = {
            message: this.req.body.message,
            position: this.req.body.position,
            email: this.req.body.email,
            linkedIn: this.req.body.linkedIn,
            fullName: this.req.body.fullName
        }

        if (validator.isEmpty(data.email) || !validator.isEmail(data.email)) {
            PageRenderer.renderPage(this.res, 'account/newcoach', 'Coach Application', this.errStatus.emailErr, null);
        } else if (validator.isEmpty(data.fullName)) {
            PageRenderer.renderPage(this.res, 'account/newcoach', 'Coach Application', this.errStatus.nameEmpty, null);
        } else if (data.position == '-- Apply As --') {
            PageRenderer.renderPage(this.res, 'account/newcoach', 'Coach Application', this.errStatus.noPosition, null);
        } else {
            PageRenderer.renderPage(this.res, 'account/newcoach', 'Coach Application', this.errStatus.success, null);
            emailmanager.send('hello@wellbit.io', 'MiBo - New Coach Application', 'application.ejs', {
                title: 'New Application',
                position: data.position,
                message: data.message,
                email: data.email,
                linkedIn: data.linkedIn,
                fullName: data.fullName
            }).then(() => {
                console.log('Successful.');
            });
            emailmanager.send(data.email, 'Your Application to MiBo', 'newcoach.ejs', {
                title: 'Your Application',
                position: data.position
            }).then(() => {
                console.log('Successful.');
            })
        }
    }

    static SetRoutes(router: express.Router) {
        router.get("/coach/apply", Route.BindRequest('renderCoachSignupRoute'));
        router.post("/coach/apply", Route.BindRequest('coachSignupRoute'));
    }

}


