import * as assert from 'assert';
import * as process from 'process';
import { create } from 'nconf';
import { NotFoundError } from '../../lib/http';
import stripe from '../../lib/stripe';
import ApiBase from './base';
import { ObjectID } from 'mongodb';
import { request } from 'https';
import * as express from "express";
import { User, UserDocument, UserModel, UserRoles } from '../../db/models/user';

import * as um from '../../db/models/user';

import { SignupModel } from '../../models/account';
import * as http from '../../lib/http';
import CrudRoute from './crud';
import * as bcrypt from 'bcryptjs';
import * as validator from 'validator';
import * as moment from 'moment';
import * as crud from './crud';
import * as crypto from 'crypto';
import emailmanager from '../../lib/email';

class Route extends CrudRoute<UserDocument> {

    validateOwnership(owner: string | ObjectID) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    create(model: SignupModel) {
        let passwordSalt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(model.password, passwordSalt);

        let doc = <SignupModel>{
            nickName: model.nickName,
            password: hash,
            email: model.email
        };
        return this.model.create(doc);
    }


    authenticate(email: string, password: string): Promise<UserDocument> {
        return new Promise((resolve, reject) => {
            this.retrieveByEMail(email).then((doc: UserDocument) => {
                if (!doc) return reject(new http.PermissionError());
                if (bcrypt.compareSync(password, doc.password)) {
                    doc.lastLogin = moment.utc().toDate();
                    doc.save().then(() => resolve(doc.toClient()), (err) => reject(err));
                }
                else reject(new http.PermissionError())
            })
        });
    }

    retrieveByEMail(email: string) {
        return UserModel.findOne().where('email', email);
    }


    authenticateRoute(req: http.ApiRequest, res: express.Response, next: Function) {
        var email = req.body.email;
        var password = req.body.password;
        this.authenticate(email, password).then((user) => { res.send(user) }, (err) => next(err))
    }

    resetPasswordRequest(email: string, url: string) {
        return this.retrieveByEMail(email).then((user) => {
            if (!user) return Promise.reject(new http.NotFoundError());
            user.resetToken = crypto.randomBytes(32).toString('hex');
            user.resetTokenValid = moment.utc().add(1, 'days').toDate();
            return user.save().then((user) => {
                return emailmanager.send(user.email, 'Password Reset Request from Mibo', 'resetpassword.ejs', {
                    nickName: user.nickName,
                    resetLink: url + '/user/resetpassword?token=' + user.resetToken
                });
            });
        })
    }

    resetPasswordRequestRoute(req: http.ApiRequest, res: express.Response, next: Function) {
        var email = req.body.email;
        if (validator.isEmpty(email) || !validator.isEmail(email))
            return next(new http.ValidationError());
        var url = req.protocol + '://' + req.get('host');
        this.resetPasswordRequest(email, url).then(() => { res.sendStatus(200) }).catch((err) => next(err));
    }

    resetPasswordRoute(req: http.ApiRequest, res: express.Response, next: Function) {
        var resetToken = req.body.resetToken;
        this.model.findOne().where('resetToken', resetToken).then((user) => {
            if (!user) return Promise.reject(new http.NotFoundError());
            if (moment.utc().toDate() > user.resetTokenValid)
                return Promise.reject(new http.ValidationError('Token Expired'));
            user.resetToken = null;
            user.resetTokenValid = null;

            var newPass = 'ali';
            var passwordSalt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(newPass, passwordSalt);
            user.password = hash;
            return user.save().then((user) => { res.sendStatus(200) }, (err) => next(err));
        }, (err) => next(err));
    }

    changePasswordRoute(req: http.ApiRequest, res: express.Response, next: Function) {
        var oldPass = req.body.oldPass;
        var newPass = req.body.newPass;
        if (validator.isEmpty(newPass) || validator.isEmpty(oldPass)) return next(new http.ValidationError('Empty Password'));
        this.retrieve(req.params.userid).then((user) => {
            if (!bcrypt.compareSync(oldPass, user.password)) return next(new http.PermissionError());
            return this.changePassword(user, newPass).then((user) => { res.sendStatus(200) });
        }).catch((err) => next(err))
    }

    changePassword(user: UserDocument, newPass: string) {
        return new Promise((resolve, reject) => {
            var passwordSalt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(newPass, passwordSalt);
            user.password = hash;
            return user.save().then((user) => { resolve(user) }, (err) => reject(err));
        });
    }

    delete(user: UserDocument) {
        return super.delete(user).then(() => {
            if (user.integrations.stripe && user.integrations.stripe.remoteId)
                stripe.deleteCustomer(user.integrations.stripe.remoteId)
        });
    }

    protected generateCreateRoute() {
        this.router.post(this.url, this.createRoute.bind(this));
    }

    constructor(router?: express.Router) {
        var model = UserModel;
        super(router, model, '/user', {
            create: true,
            update: true
        });
        this.router && this.router.post('/user/authenticate', this.authenticateRoute.bind(this));
        this.router && this.router.post('/user/resetpassword', this.resetPasswordRequestRoute.bind(this));
        this.router && this.router.get('/user/resetpassword', this.resetPasswordRoute.bind(this));
        this.router && this.router.post('/user/changepassword/:userid', this.changePasswordRoute.bind(this));

    }
}

export function init(router?: express.Router) { return route = new Route(router) };
export let route: Route;