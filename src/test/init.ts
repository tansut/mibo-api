import { UserDocument, UserModel, UserRoles } from '../db/models/user';
import db from '../db';
import apiRoutes from '../route/api';
import { route } from '../route/api/user';
import * as mocha from 'mocha';

import usertests from './user';
import paymentests from './payment';
import apiApp from '../api';
import config from '../config';
import * as request from 'request';
import * as lib from './lib';


export let testUser: UserDocument;

describe('tests', function () {
    before(function () {
        return apiApp().bootstrap().then(() => {
            return route.retrieveByEMail('test@mibo.io').then((user) => {
                if (user) return route.delete(user);
            }).then(() => {
                return route.create({
                    email: 'test@mibo.io',
                    password: 'foo',
                    nickName: 'testuser'
                })
            }).then((user) => {
                testUser = user;
            });
        });
        // db.connect().then(() => {
        //     apiRoutes.use();
        //     route.retrieveByEMail('test@mibo.io').then((user) => {
        //         if (user) return route.delete(user);
        //     }).then(() => {
        //         return route.create({
        //             email: 'test@mibo.io',
        //             password: 'foo',
        //             nickName: 'testuser'
        //         })
        //     }).then((user) => {
        //         testUser = user;
        //         done();
        //     })
        // }, (err) => done(err))
    });
    usertests();
    paymentests();
});