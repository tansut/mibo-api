import { UserDocument, UserModel, UserRoles } from '../db/models/user';
import db from '../db';
import apiRoutes from '../route/api';
import UserRoute from '../route/api/user';
import * as mocha from 'mocha';

import usertests from './user';
import paymentests from './payment';
import apiApp from '../api';
import config from '../config';
import * as request from 'request';
import * as lib from './lib';


export let testUser: UserDocument;

export let testemail = 'tansut@gmail.com';
let route = new UserRoute();

describe('tests', function () {
    before(function () {
        return apiApp().bootstrap().then(() => {
            var route = new UserRoute();
            debugger;    
            return  route.retrieveByEMail(testemail).then((user) => {
                if (user) return route.delete(user);
            }).then(() => {
                return lib.post('/user', {
                    body: {
                        email: testemail,
                        password: 'foo',
                        nickName: 'testuser'
                    }
                }).then((result) => {
                    result.should.have.property('_id');
                    return result;
                })
            }).then((user) => {
                testUser = <UserDocument>user;
            });
        });
    });
    usertests();
    paymentests();
});