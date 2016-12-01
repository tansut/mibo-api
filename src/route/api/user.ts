import ApiBase from './base';

import { request } from 'https';
import * as express from "express";
import { User, UserDocument, UserModel } from '../../db/models/user';
import * as http from '../../lib/http';
import CrudRoute from './crud';
import * as bcrypt from 'bcryptjs';
import * as validator from 'validator';
import * as moment from 'moment';

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

    protected generateCreateRoute() {
        this.router.post(this.url, this.createRoute.bind(this));
    }

    constructor(router: express.Router) {
        super(router, UserModel, '/user', {
            create: true,
            update: true
        });
        this.router.post('/user/authenticate', this.authenticateRoute.bind(this));
        this.generateRetrieveRoute();
    }
}

export var user: UserRoute;

export default (router: express.Router) => user = new UserRoute(router); 