import { debug } from 'util';
import { ConsultantDocument } from '../../db/models/consultant';
import ConsultantRoute from './consultant';
import ChatRoute from './chatapi';
import { IRequestParams } from '../baserouter';
import * as assert from 'assert';
import * as process from 'process';
import { create } from 'nconf';
import { NotFoundError } from '../../lib/http';
import stripe from '../../lib/stripe';
import ApiBase from './base';
import { ObjectID } from 'mongodb';
import { request } from 'https';
import * as express from "express";
import { User, UserDocument, UserModel } from '../../db/models/user';
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
import { Auth, UserRoles } from '../../lib/common';

interface GeneratedTokenData {
    accessToken: authorization.IEncryptedAccessTokenData;
    refreshToken: string;
}

export default class UserRoute extends CrudRoute<UserDocument> {

    @Auth.Anonymous()
    createRoute() {
        return this.create(this.req.body).then((user: any) => {
            return this.createTokens(user).then((generatedTokens: GeneratedTokenData) => {
                this.res.send({ user: user.toClient(), token: generatedTokens, consultants: user['consultants'] });
            })
        })
    }

    create(model: SignupModel): Promise<UserDocument> {
        let passwordSalt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(model.password, passwordSalt);

        let doc = <SignupModel>{
            nickName: model.nickName,
            password: hash,
            email: model.email,
            ivCode: (Math.random() * 999999).toString() // todo
        };
        if (model.roles && config.nodeenv != 'production')
            doc.roles = model.roles;
        return this.insertDb(doc).then((doc) => {
            return new Promise<UserDocument>((res, rej) => {
                emailmanager.send(doc.email, 'Welcome to MiBo', 'welcome.ejs', {
                    title: 'Welcome!',
                    downloadLink: 'http://downloadLink'
                }).then(() => {
                    if (doc.roles && doc.roles.length > 0) {
                        var list = [];
                        doc.roles.forEach((role) => {
                            var consultantRoute = new ConsultantRoute(this.constructorParams);
                            if ([UserRoles.dietitian, UserRoles.sales, UserRoles.therapist, UserRoles.trainer].indexOf(role) >= 0)
                                list.push(
                                    consultantRoute.create({
                                        user: doc._id,
                                        active: true,
                                        firstName: 'Set a name',
                                        lastName: 'Surname',
                                        role: role,

                                    }, doc)
                                )
                            Promise.all(list).then((results: Array<ConsultantDocument>) => {
                                doc['consultants'] = results.map((c) => c.toClient());
                                res(doc)
                            }).catch((err) => rej(err));
                        })
                    } else res(doc);
                }).catch((err) => rej(err));
            })
        });
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

    private createTokens(user: UserDocument): Promise<any> {
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

    useRefreshToken(refreshTokenData: string) {
        return new Promise((resolve, reject) => {
            authorization.default.decryptRefreshToken(refreshTokenData).then((user: UserDocument) => {
                return this.createTokens(user).then((generatedTokens => {
                    return { user: user.toClient(), tokens: generatedTokens };
                }));
            }).then((responseData) => {
                this.res.send(responseData);
                resolve();
            }).catch((err) => {
                var errorDetail = { message: 'Refresh Token Not Validated Msg :' + err, PermissionErrorType: 'refreshTokenNotValidated' };
                var generatedError = new http.PermissionError(JSON.stringify(errorDetail));
                reject(generatedError);
            });
        });
    }

    @Auth.Anonymous()
    useRefreshTokenRoute() {
        var refreshTokenData = <string>this.req.body.refreshTokenData;
        if (!refreshTokenData) {
            var errorDetail = { message: 'Refresh Token Not Granted', PermissionErrorType: 'refreshTokenRequired' };
            return Promise.reject(new http.PermissionError(JSON.stringify(errorDetail)));
        } else {
            return this.useRefreshToken(refreshTokenData);
        }
    }

    resetPasswordRequest(email: string, url: string) {
        return this.retrieveByEMail(email).then((user) => {
            if (!user) return Promise.reject(new http.NotFoundError());
            user.resetToken = crypto.randomBytes(32).toString('hex');
            user.resetTokenValid = moment.utc().add(1, 'days').toDate();
            return user.save().then((user) => {
                return emailmanager.send(user.email, 'Password Reset Request from MiBo', 'resetpassword.ejs', {
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

    setNick(nickName: string) {
        return this.retrieve(this.req.params.userid).then((user) => {
            user.nickName = nickName;
            return user.save();
        })
    }

    setNickRoute() {
        return this.setNick(this.req.body.nickName).then((user) => this.res.sendStatus(200));
    }


    setRequestedRole(role: string) {
        return this.retrieve(this.req.params.userid).then((user) => {
            user.requestedRole = role;
            return user.save();
        })
    }

    setRequestedRoleRoute() {
        return this.setRequestedRole(this.req.body.role).then((user) => this.res.sendStatus(200));
    }

    setRequestedRoleRoute

    changePassword(user: UserDocument, newPass: string) {
        var passwordSalt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(newPass, passwordSalt);
        user.password = hash;
        return user.save().then((user) => {
            return emailmanager.send(user.email, 'Password Change Notification from MiBo', 'passwordchange.ejs', {
                nickName: user.nickName
            });
        })
    }

    delete(user: UserDocument) {
        var promiseList = [];
        if (user.integrations.stripe && user.integrations.stripe.remoteId)
            promiseList.push(stripe.deleteCustomer(user.integrations.stripe.remoteId));
        var consultantRoute = new ConsultantRoute(this.constructorParams);
        promiseList.push(consultantRoute.deleteByUser(user));
        promiseList.push(new ChatRoute(this.constructorParams).deleteByUser(user));
        return Promise.all(promiseList).then(() => super.delete(user));
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
        router.post("/user/setnick/:userid", UserRoute.BindRequest('setNickRoute'));
        router.post("/user/setrequestedrole/:userid", UserRoute.BindRequest('setRequestedRoleRoute'));
    }

    constructor(reqParams?: IRequestParams) {
        super(reqParams, UserModel);
    }
}
