import { json } from 'body-parser';
import { debug } from 'util';
import * as mocha from 'mocha';
import * as lib from './lib';


export default function () {
    describe.only('consultant', function () {
        it('should locate a sales consultant', function () {
            return lib.get('/consultant/locate?role=sales', {}, 'user').then((consultant) => {

            });
        })

        it('should get consultant data', function () {
            return lib.get(`/consultant/${lib.authData['sales'].consultant._id}`, {
                json: true
            }, 'user')
        })

        // it('should get consultant  by user', function () {
        //     return lib.get(`/consultant/byuser/${lib.authData['user'].doc._id}`, {
        //         json: true
        //     }, 'user')
        // })

        it('should get a list of consultants', function () {
            return lib.get(`/consultant/search`, {
                json: true
            }, 'sales')
        })

        it('should get consultant data', function () {
            return lib.get(`/consultant/${lib.authData['sales'].consultant._id}`, {
                json: true
            }, 'user')
        })

        it('should set passive sales consultant', function () {
            return lib.post(`/consultant/${lib.authData['sales'].consultant._id}/statusupdate`, {
                body: {
                    active: false
                }
            }, 'sales')
        })
        it('should set active sales consultant', function () {
            return lib.post(`/consultant/${lib.authData['sales'].consultant._id}/statusupdate`, {
                body: {
                    active: true
                }
            }, 'sales')
        })
    });
}