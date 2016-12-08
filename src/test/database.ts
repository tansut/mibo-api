import * as mocha from 'mocha';
import db from '../db';

describe('database', function () {
    describe('#connect()', function () {
        it('should connect to database', function () {
            return db.connect();
        });
    });
});