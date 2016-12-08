import { NotFoundError } from '../../lib/http';
import ApiBase from './base';
import { ObjectID } from 'mongodb';
import { request } from 'https';
import * as express from "express";
import { User, UserDocument, UserModel } from '../../db/models/user';
import * as http from '../../lib/http';
import CrudRoute from './crud';
import * as bcrypt from 'bcryptjs';
import * as validator from 'validator';
import * as moment from 'moment';
import * as crud from './crud';
import * as crypto from 'crypto';
import emailmanager from '../../lib/email';

class UserRoute extends CrudRoute<UserDocument> {

    create(doc: UserDocument) {
        var passwordSalt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(doc.password, passwordSalt);
        doc.password = hash;
        return this.model.create(doc);
    }


    authenticate(email: string, password: string): Promise<UserDocument> {
        return new Promise((resolve, reject) => {
            this.model.findOne().where('email', email).then((doc: UserDocument) => {
                if (!doc) return reject(new http.PermissionError());
                if (bcrypt.compareSync(password, doc.password)) {
                    doc.lastLogin = moment.utc().toDate();
                    doc.save().then(() => resolve(doc.toClient()), (err) => reject(err));
                }
                else reject(new http.PermissionError())
            })
        });
    }

    authenticateRoute(req: http.ApiRequest, res: express.Response, next: Function) {
        var email = req.body.email;
        var password = req.body.password;
        this.authenticate(email, password).then((user) => { res.send(user) }, (err) => next(err))
    }

    resetPasswordRequest(email: string) {
        return this.model.findOne().where('email', email).then((user) => {
            if (!user) return Promise.reject(new http.NotFoundError());
            user.resetToken = crypto.randomBytes(32).toString('hex');
            user.resetTokenValid = moment.utc().add(1, 'days').toDate();
            return user.save().then((user) => {
                emailmanager.send(user.email, 'Password reset request from Mibo', 'resetpassword.html', {
                    token: user.resetToken
                })
            });
        })
    }

    resetPasswordRequestRoute(req: http.ApiRequest, res: express.Response, next: Function) {
        var email = req.body.email;
        if (validator.isEmpty(email) || !validator.isEmail(email))
            return next(new http.ValidationError());
        this.resetPasswordRequest(email).then(() => { res.sendStatus(200) }, (err) => next(err))

    }

    resetPassword(req: http.ApiRequest, res: express.Response, next: Function) {
        //Todo: 1. get token from query string,
        // 2 validate token, find user
        // generate a new password
        // send ne password to user
        // save to db
        // destroy token & validity 

    }


    protected generateCreateRoute() {
        this.router.post(this.url, this.createRoute.bind(this));
    }

    constructor(router: express.Router) {
        super(router, UserModel, '/user', {
            create: true,
            update: true
        });
        this.router.post('/user/authenticate', this.authenticateRoute.bind(this));
        this.router.post('/user/resetpassword', this.resetPasswordRequestRoute.bind(this));
        this.router.get('/user/resetpassword', this.resetPasswordRoute.bind(this));
        this.generateRetrieveRoute();
    }
}

export var user: UserRoute;

export default (router: express.Router) => user = new UserRoute(router); 