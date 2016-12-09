import * as mocha from 'mocha';
import * as user from '../db/models/user';
import UserRoute from '../route/api/user';

describe('account', function () {
    describe('#signup()', function () {
        it('should signup user', function () {
            return UserRoute.create({
                email: 'test@test.com',
                nickName: 'testuser',
                password: 'foo@foo'
            })
        });
    });
});