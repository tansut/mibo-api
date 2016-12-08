import { request } from 'https';
import * as express from "express";
import * as http from '../../lib/http';
import ApiBase from './base';
import { UserModel } from '../../db/models/user';


class StatusRoute extends ApiBase {

    tou(req: http.ApiRequest, res: express.Response, next: Function) {
        //TODO: Utku
        // read file from disk and send to client
        res.send('Oh yeah!');
    }

    constructor(router: express.Router) {
        super(router);
        router.get("/tou", this.tou.bind(this));
    }
}

export let status: StatusRoute;

export default (router: express.Router) => status = new StatusRoute(router); 