
import { UserDocument, UserModel, UserRoles } from '../db/models/user';
import db from '../db';
import apiRoutes from '../route/api';
import { route } from '../route/api/user';
import * as mocha from 'mocha';

let inited = false;

export let testUser: UserDocument;

export let done = (done) => {
    inited ? done() :
        db.connect().then(() => {
            apiRoutes.use();

            UserModel.findOne().where('email', 'test@mibo.io').then((user) => {
                if (user) {
                    testUser = user;
                    inited = true;
                    done();
                } else return route.create({
                    email: 'test@mibo.io',
                    password: 'foo',
                    nickName: 'testuser'
                }).then((user) => {
                    testUser = user;
                    inited = true;
                    done();
                })
            })


        }, (err) => done(err))
}

describe('hook', function () {
    before(done);
});