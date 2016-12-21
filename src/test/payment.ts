import * as mocha from 'mocha';
import * as common from '../lib/common';
import stripe from '../lib/stripe';
import * as lib from './lib';


export default function () {
    describe('payment', function () {
        it('should create basic-plan for test-user', function () {
            var plan = common.Plans.messageonly6mlyT;
            return stripe.createTokenSample().then((token) => {
                return lib.post('/plan/create/'.concat(lib.authData.user.doc._id), {
                    body: {
                        plan: plan,
                        source: token.id
                    }
                }, 'user')
            })
        })
        it('should get basic-plan for test-user', function () {
            var plan = common.Plans.messageonly3mly;
            return stripe.createTokenSample().then((token) => {
                return lib.get('/plan/get/'.concat(lib.authData.user.doc._id), {
                    json: true
                }, 'user').then((result) => {
                    result.should.have.property('plan').be.eql(result.plan);
                })
            })
        })
        it('should change plan', function () {
            var plan = common.Plans.messageonly3mly;
            return lib.post('/plan/change/'.concat(lib.authData.user.doc._id), {
                body: {
                    plan: plan
                }
            }, 'user')
        })
    });
}