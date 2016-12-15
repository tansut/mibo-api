import * as mocha from 'mocha';
import { testUser } from './init';
import * as common from '../lib/common';
import stripe from '../lib/stripe';
import * as lib from './lib';


export default function () {
    describe.only('payment', function () {
        it('should create basic-plan for test-user', function () {
            var plan = common.Plans.basicMonthly;
            return stripe.createTokenSample().then((token) => {
                return lib.post('/plan/create/'.concat(testUser._id), {
                    body: {
                        plan: plan,
                        source: token.id
                    }
                })
            })
        })
        it('should get basic-plan for test-user', function () {
            var plan = common.Plans.basicMonthly;
            return stripe.createTokenSample().then((token) => {
                return lib.get('/plan/get/'.concat(testUser._id), {
                    json: true
                }).then((result) => {
                    result.should.have.property('plan').be.eql(result.plan);
                })
            })
        })
        it('should change plan', function () {
            var plan = common.Plans.messageonly3mly;
            return lib.post('/plan/change/'.concat(testUser._id), {
                body: {
                    plan: plan
                }
            })
        })
    });
}