import * as mocha from 'mocha';
import { testUser, done } from './init';
import { route } from '../route/api/user';


describe('account', function () {
    before(done);

    describe('#signin()', function () {
        it('should signin test user', function () {
            return route.authenticate('test@mibo.io', 'foo');
        });
    });
});

