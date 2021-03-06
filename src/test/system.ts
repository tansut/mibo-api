import * as mocha from 'mocha';
import * as common from '../lib/common';
import stripe from '../lib/stripe';
import * as lib from './lib';


export default function () {
    describe('status', function () {
        it('should send OK status', function () {
            return lib.get('/status').then((result) => {
                result.should.be.exactly('Oh yeah!');
            })
        });
        it('should get TOU', function () {
            return lib.get('/tou').then((result) => {

            })
        });
        it('should get Privacy', function () {
            return lib.get('/privacy').then((result) => {

            })
        });
    });
}