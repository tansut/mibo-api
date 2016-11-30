import { request } from 'https';
import * as express from "express";
import * as requests from '../../lib/api.request';
import ApiBase from './base';
import { User } from '../../db/models/user';


class StatusRoute extends ApiBase {

    status(req: requests.ApiRequest, res: express.Response, next: Function) {
        res.send('OK');
    }

    test2(req: requests.ApiRequest, res: express.Response, next: Function) {
        User.find().then((result) => res.send(result), (err) => next(err));
    }

    test(req: requests.ApiRequest, res: express.Response, next: Function) {
        var user = new User();
        user.firstName = "Tansu";
        user.lastName = "Türkoğlu";
        user.email = "tansu@physioh.com";
        user.save().then(() => res.send(user)).catch((err) => next(err));
    }

    constructor(router: express.Router) {
        super(router);
        router.get("/status", this.authenticate.bind(this), this.status.bind(this));
        router.get("/test", this.test.bind(this));
        router.get("/test2", this.test2.bind(this));
    }
}

export let status: StatusRoute;

export default (router: express.Router) => status = new StatusRoute(router); 