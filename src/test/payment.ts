import * as mocha from 'mocha';
import init from './init';
import { route } from '../route/api/payment';
import * as common from '../lib/common';


describe('payment', function () {
    before(init);

    describe('#createPlan()', function () {
        it('should signup user', function () {
            var plan = common.Plans.basicMonthly;
            //route.createPlan()
        });
    });
});

