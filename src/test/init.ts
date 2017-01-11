import { ConsultantDocument } from '../db/models/consultant';
import { UserDocument, UserModel } from '../db/models/user';
import db from '../db';
import apiRoutes from '../route/api';
import UserRoute from '../route/api/user';
import * as mocha from 'mocha';
import usertests from './user';
import paymentests from './payment';
import consultantests from './consultant';
import systemtests from './system';
import chattests from './chats';

import apiApp from '../api';
import config from '../config';
import * as request from 'request';
import * as lib from './lib';


export let testemail = 'tansut@gmail.com';




describe('tests', function () {
    before(function () {
        return apiApp().bootstrap().then(() => {
            return lib.initUsers();
        });
    });
    systemtests();
    usertests();
    paymentests();
    consultantests();
    chattests();
    // after(function () {
    //     return lib.removeUsers();
    // });
});