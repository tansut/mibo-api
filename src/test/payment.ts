import * as mocha from 'mocha';
import { testUser } from './init';
import { route } from '../route/api/payment';
import * as common from '../lib/common';
import stripe from '../lib/stripe';
import * as lib from './lib';


export default function() {
    describe('payment', function() {
        describe('#createPlan()', function() {
            it('should create basic-plan for test-user', function() {
                var plan = common.Plans.basicMonthly;

                return stripe.createTokenSample().then((token) => {
                    return lib.post('/plan/create/'.concat(testUser._id.toString()), {
                        body: {
                            plan: plan,
                            source: token.id
                        }
                    })
                })
            })
            it('should get basic-plan for test-user', function() {
                var plan = common.Plans.basicMonthly;
                return stripe.createTokenSample().then((token) => {
                    return lib.get('/plan/get/'.concat(testUser._id.toString()), {
                        json: true
                    }).then((result) => {
                        result.should.have.property('plan').be.eql(result.plan);
                    })
                })
            })
        });
    });
}