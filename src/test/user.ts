import * as mocha from 'mocha';
import { testUser, testemail } from './init';
import * as lib from './lib';

export default function () {
    describe('account', function () {
        it('should signin test user', function () {
            return lib.post('/user/authenticate', {
                body: {
                    email: testemail,
                    password: 'foo'
                }
            }).then((result) => {
                result.should.have.property('user');
                result.should.have.property('token');
                lib.authenticationDone(result.token);
            })
        });

        it('should change password', function () {
            return lib.authenticationDone().then((authhToken => {
                return lib.post('/user/changepassword/'.concat(testUser._id), {
                    body: {
                        oldPass: 'foo',
                        newPass: 'foo2'
                    }
                });
            }))
        });

        it('should signin with new password', function () {
            return lib.post('/user/authenticate', {
                body: {
                    email: testemail,
                    password: 'foo2'
                }
            }).then((result) => {
                result.should.have.property('user');
                result.should.have.property('token');
            })
        });
        it('should send reset password e-mail', function () {
            return lib.post('/user/resetpassword', {
                body: {
                    email: testemail
                }
            })
        });
        it('should not authorize with incorrect credentials', function () {
            return new Promise((resolve, reject) => {
                lib.post('/user/authenticate', {
                    body: {
                        email: 'incorrect__@email.com',
                        password: 'aaa'
                    }
                }).then((result) => {
                    reject();
                }).catch((err) => {
                    err.should.have.property('statusCode').be.eql(401);
                    resolve();
                })
            });
        });
        it('should not reset with incorrect e-mail', function () {
            return new Promise((resolve, reject) => {
                lib.post('/user/resetpassword', {
                    body: {
                        email: 'incorrect__@email.com',
                    }
                }).then((result) => {
                    reject();
                }).catch((err) => {
                    err.should.have.property('statusCode').be.eql(404);
                    resolve();
                })
            });
        });
        it('should set a nickname for user', function () {
            return lib.authenticationDone().then((authhToken => {
                return lib.post('/user/setnick/'.concat(testUser._id), {
                    body: {
                        nickName: 'testnick'
                    }
                })
            }))
        });
        // describe('#status()', function () {
        //     it('should send OK status', function () {
        //         return lib.get('/status').then((result) => {
        //             result.should.be.exactly('Oh yeah!');
        //         })
        //     });
        // });
    });
}
