import * as mocha from 'mocha';
import { testUser } from './init';
import { route } from '../route/api/user';
import * as lib from './lib';

export default function () {
    describe('account', function () {

        describe('#signin()', function () {
            it('should signin test user', function () {
                return lib.post('/user/authenticate', {
                    body: {
                        email: 'test@mibo.io',
                        password: 'foo'
                    }
                }).then((result) => {
                    result.should.have.property('nickName');
                })
            });
        });

        describe('#status()', function () {
            it('should send OK status', function () {
                return lib.get('/status').then((result) => {
                    result.should.be.exactly('Oh yeah!');
                })
            });
        });
    });
}
