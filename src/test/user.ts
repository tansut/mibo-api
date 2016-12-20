import * as mocha from 'mocha';
import * as lib from './lib';

export default function () {

    describe('account', function () {
        it('should signin test user', function () {
            return lib.post('/user/authenticate', {
                body: {
                    email: lib.activeConfig.user.testemail,
                    password: 'foo'
                }
            }).then((result) => {
                result.should.have.property('user');
                result.should.have.property('token');
            })
        });

        it('should change password', function () {
            return lib.forceAuthentication('user').then(() => {
                lib.post('/user/changepassword/'.concat(lib.authData.user.doc._id), {
                    body: {
                        oldPass: 'foo',
                        newPass: 'foo'
                    }
                }, 'user');
            })
        });

        it('should signin with new password', function () {
            return lib.post('/user/authenticate', {
                body: {
                    email: lib.activeConfig.user.testemail,
                    password: 'foo'
                }
            }, 'user').then((result) => {
                result.should.have.property('user');
                result.should.have.property('token');
            })

        });
        it('should send reset password e-mail', function () {
            return lib.post('/user/resetpassword', {
                body: {
                    email: lib.activeConfig.user.testemail
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
            return lib.post('/user/setnick/'.concat(lib.authData.user.doc._id), {
                body: {
                    nickName: 'testnick'
                }
            }, 'user')
        });

        it('should get new account page', function () {
            return lib.get('/account/new', {

            })
        });

    });
}
