import { UserRoles } from '../lib/common';
import * as mocha from 'mocha';
import * as common from '../lib/common';
import stripe from '../lib/stripe';
import * as lib from './lib';


export default function () {
    describe.only('payment', function () {
        it('should create a subscription for a dietitian', function () {
            var plan = common.Plans.messageonly6mlyT;
            return lib.forceAuthenticationAll(['user']).then(() => {
                return stripe.createTokenSample().then((token) => {
                    return lib.post(`/subscription/create/${lib.authData.user.doc._id}/${UserRoles.dietitian}`, {
                        body: {
                            plan: plan,
                            source: token.id
                        }
                    }, 'user').then((result) => {
                        result.should.have.property('created');
                    })
                })
            });
        })

        it('should change dietitian subscription', function () {
            var plan = common.Plans.message1vidperm6mlyT;
            return lib.forceAuthenticationAll(['user']).then(() => {
                return lib.post(`/subscription/change/${lib.authData.user.doc._id}/${UserRoles.dietitian}`, {
                    body: {
                        plan: plan
                    }
                }, 'user').then((result) => {
                    result.should.have.property('created');
                })
            });
        })

        it('should get coupon information', function () {
            return lib.forceAuthenticationAll(['user']).then(() => {
                return lib.get(`/coupon/test-coupon`, {
                    json: true
                }, 'user').then((result) => {
                    result.should.have.property('valid').be.eql(true);
                })
            });
        })

        it('should not get invalid coupon', function () {
            return new Promise((resolve, reject) => {
                lib.forceAuthenticationAll(['user']).then(() => {
                    lib.get(`/coupon/test-coupon-invalid`, {
                        json: true
                    }, 'user').then((result) => {
                        reject();
                    }).catch((err) => {
                        err.should.have.property('statusCode').be.eql(404);
                        resolve();
                    })
                });
            })
        })

        it('should create an other subscription for a trainer with a coupon', function () {
            var plan = common.Plans.messageonly6mlyT;
            return lib.forceAuthenticationAll(['user']).then(() => {
                return stripe.createTokenSample().then((token) => {
                    return lib.post(`/subscription/create/${lib.authData.user.doc._id}/${UserRoles.trainer}`, {
                        body: {
                            plan: plan,
                            source: token.id,
                            coupon: 'test-coupon'
                        }
                    }, 'user').then((result) => {
                        result.should.have.property('created');
                    })
                })
            });
        })

        it('should get list of plans available for a currency', function () {
            return lib.forceAuthenticationAll(['user']).then(() => {
                return lib.get('/plans?currency=USD', {
                    json: true
                }, 'user').then((result) => {
                    debugger;
                })
            });
        })

        it('should get list of subscriptions', function () {
            return lib.forceAuthenticationAll(['user']).then(() => {
                return stripe.createTokenSample().then((token) => {
                    return lib.get('/subscription/get/'.concat(lib.authData.user.doc._id), {
                        json: true
                    }, 'user').then((result) => {
                        result.should.have.property(UserRoles.dietitian);
                        result.should.have.property(UserRoles.trainer);
                    })
                })
            });
        })
    });
}