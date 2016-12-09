import * as mocha from 'mocha';

import { testUser } from './init';
import { route } from '../route/api/payment';
import * as common from '../lib/common';
import stripe from '../lib/stripe';


export default function () {
    describe('payment', function () {
        describe('#createPlan()', function () {
            it('should create basic-plan for test-user', function () {
                var plan = common.Plans.basicMonthly;
                return stripe.createTokenSample().then((token) => {
                    return route.createPlan(testUser, plan, token.id);
                })
            });
        });
    });
}