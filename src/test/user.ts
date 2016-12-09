import * as mocha from 'mocha';
import { testUser } from './init';
import { route } from '../route/api/user';


export default function() {
    describe('account', function() {
        describe('#signin()', function() {
            it('should signin test user', function() {
                return route.authenticate('test@mibo.io', 'foo');
            });
        });
    });
}
