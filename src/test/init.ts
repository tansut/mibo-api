import db from '../db';
import apiRoutes from '../route/api';

let inited = false;

export default (done) => {
    inited ? done() :
        db.connect().then(() => {
            apiRoutes.use();
            inited = true;
            done();
        }, (err) => done(err))
}