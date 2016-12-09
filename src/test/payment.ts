import * as mocha from 'mocha';

import { testUser, done } from './init';
import { route } from '../route/api/payment';
import * as common from '../lib/common';


describe('payment', function () {
    before(done);

    describe('#createPlan()', function () {
        it('should create basic-plan for test-user', function () {
            this.timeout(15000);
            var plan = common.Plans.basicMonthly;
            return route.createPlan(testUser, plan, 'tok_19OnirKkLU50P5nzn4CUgLer');
        });
    });
});

