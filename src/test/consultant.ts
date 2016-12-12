import * as mocha from 'mocha';
import * as lib from './lib';


export default function () {
    describe('consultant', function () {
        it('should locate a sales consultant', function () {
            return lib.authenticationDone().then((authhToken => {
                return lib.get('/consultant/locate?role=sales').then((consultant) => {

                });
            }))
        })
    });
}