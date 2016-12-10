import { IRequestParams } from './base';
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
import config from '../../config';
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
import * as authorization from '../../lib/authorizationToken';
import { Auth } from '../../lib/common';

interface GeneratedTokenData {
    accessToken: authorization.IEncryptedAccessTokenData;
    refreshToken: string;
}

export default class UserRoute extends CrudRoute<UserDocument> {

    @Auth.Anonymous()
    createRoute() {
        return super.createRoute();
    }

    create(model: SignupModel) {
        let passwordSalt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(model.password, passwordSalt);

        let doc = <SignupModel>{
            nickName: model.nickName,
            password: hash,
            email: model.email,
            ivCode: (Math.random() * 999999).toString() // todo
        };
        return this.insertDb(doc);
    }

    authenticate(email: string, password: string): Promise<UserDocument> {
        return new Promise((resolve, reject) => {
            this.retrieveByEMail(email).then((doc: UserDocument) => {
                if (!doc) return reject(new http.PermissionError());
                if (bcrypt.compareSync(password, doc.password)) {
                    doc.lastLogin = moment.utc().toDate();
                    doc.save().then(() => resolve(doc), (err) => reject(err));
                }
                else reject(new http.PermissionError())
            })
        });
    }

    retrieveByEMail(email: string) {
        return UserModel.findOne().where('email', email);
    }

    private createTokens(user: UserDocument): Promise<GeneratedTokenData> {
        var accessToken = user.generateAccessToken();
        var accessTokenEncrypted = authorization.default.encryptAccessToken(accessToken);
        return authorization.default.encryptRefreshToken(user._id, accessToken).then((encryptedRefreshToken: string) => {
            return { accessToken: accessTokenEncrypted, refreshToken: encryptedRefreshToken };
        });
    }

    @Auth.Anonymous()
    authenticateRoute() {
        var email = this.req.body.email;
        var password = this.req.body.password;
        return this.authenticate(email, password).then((user) => {
            return this.createTokens(user).then((generatedTokens: GeneratedTokenData) => {
                this.res.send({ user: user.toClient(), token: generatedTokens });
            })
        });
    }

    useRefreshToken(refreshTokenData: authorization.IEncryptedRefreshTokenData) {
        // todo
        authorization.default.decryptRefreshToken(refreshTokenData.refresh_token, refreshTokenData.tag);
    }

    useRefreshTokenRoute() {
        var refreshTokenData = <authorization.IEncryptedRefreshTokenData>this.req.body.refreshTokenData;
        this.useRefreshToken(refreshTokenData);
    }

    resetPasswordRequest(email: string, url: string) {
        return this.retrieveByEMail(email).then((user) => {
            if (!user) return Promise.reject(new http.NotFoundError());
            user.resetToken = crypto.randomBytes(32).toString('hex');
            user.resetTokenValid = moment.utc().add(1, 'days').toDate();
            return user.save().then((user) => {
                return emailmanager.send(user.email, 'Password Reset Request from Mibo', 'resetpassword.ejs', {
                    nickName: user.nickName,
                    resetLink: url + '/account/resetpassword?token=' + user.resetToken
                });
            });
        })
    }


    @Auth.Anonymous()
    resetPasswordRequestRoute() {
        var email = this.req.body.email;
        if (validator.isEmpty(email) || !validator.isEmail(email))
            return Promise.reject(new http.ValidationError());
        var url = config.webUrl;
        return this.resetPasswordRequest(email, url).then(() => { this.res.sendStatus(200) });
    }

    changePasswordRoute() {
        var oldPass = this.req.body.oldPass;
        var newPass = this.req.body.newPass;
        if (validator.isEmpty(newPass) || validator.isEmpty(oldPass)) return this.next(new http.ValidationError('Empty Password'));
        return this.retrieve(this.req.params.userid).then((user) => {
            if (!bcrypt.compareSync(oldPass, user.password)) return Promise.reject(new http.PermissionError());
            return this.changePassword(user, newPass).then(() => this.res.sendStatus(200));
        })
    }

    changePassword(user: UserDocument, newPass: string) {
        var passwordSalt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(newPass, passwordSalt);
        user.password = hash;
        return user.save().then((user) => {
            return emailmanager.send(user.email, 'Password Change Notification from Mibo', 'passwordchange.ejs', {
                nickName: user.nickName
            });
        })
    }

    delete(user: UserDocument) {
        return super.delete(user).then(() => {
            if (user.integrations.stripe && user.integrations.stripe.remoteId)
                stripe.deleteCustomer(user.integrations.stripe.remoteId)
        });
    }

    protected static generateCreateRoute(url: string, router: express.Router) {
        router.post(url, this.BindRequest('createRoute'));
    }

    static SetRoutes(router: express.Router) {
        UserRoute.SetCrudRoutes("/user", router, {
            create: true,
            update: true
        });

        router.post("/user/authenticate", UserRoute.BindRequest('authenticateRoute'));
        router.post("/user/resetpassword", UserRoute.BindRequest('resetPasswordRequestRoute'));
        router.post("/user/changepassword/:userid", UserRoute.BindRequest('changePasswordRoute'));
        router.post("/user/useRefreshToken", UserRoute.BindRequest('useRefreshTokenRoute'));
    }

    constructor(reqParams?: IRequestParams) {
        super(reqParams, UserModel);
    }
}
