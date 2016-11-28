import * as console from 'console';
import * as express from "express";
import ApiRoute from '../../lib/apiroute';
import { Auth } from '../../middlewares/auth';

export default class IndexRoute extends ApiRoute {

    Status(req: express.Request, res: express.Response, next: Function) {
        res.send('OK');
    }

    constructor(router: express.Router) {
        super(router);
        router.get("/status", Auth.Force.bind(Auth), this.Status.bind(this));
    }
}