import { UserRoles } from '../lib/common';
import * as mocha from 'mocha';
import * as common from '../lib/common';
import stripe from '../lib/stripe';
import * as lib from './lib';


export default function () {
    describe('payment', function () {
        it('should create a subscription for a dietitian', function () {
            var plan = common.Plans.messageonly6mlyT;
            return lib.forceAuthenticationAll(['user']).then(() => {
                return stripe.createTokenSample().then((token) => {
                    return lib.post(`/subscription/create/${lib.authData.user.doc._id}/${UserRoles.dietitian}`, {
                        body: {
                            plan: plan,
                            source: token.id
                        }
                    }, 'user')
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
                }, 'user')
            });
        })
        it('should create an other subscription for a trainer', function () {
            var plan = common.Plans.messageonly6mlyT;
            return lib.forceAuthenticationAll(['user']).then(() => {
                return stripe.createTokenSample().then((token) => {
                    return lib.post(`/subscription/create/${lib.authData.user.doc._id}/${UserRoles.trainer}`, {
                        body: {
                            plan: plan,
                            source: token.id
                        }
                    }, 'user')
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