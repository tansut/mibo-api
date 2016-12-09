import * as mocha from 'mocha';
import init from './init';
import { route } from '../route/api/user';


describe('account', function () {
    before(init);

    describe('#signup()', function () {
        it('should signup user', function () {
            return route.create({
                email: 'test@test.com',
                nickName: 'testuser',
                password: 'foo@foo'
            })
        });
    });
});

