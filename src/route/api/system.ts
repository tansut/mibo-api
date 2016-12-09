import { request } from 'https';
import * as express from "express";
import * as http from '../../lib/http';
import ApiBase from './base';
import { UserModel } from '../../db/models/user';
import * as fs from 'fs';


class StatusRoute extends ApiBase {

    touRoute(req: http.ApiRequest, res: express.Response, next: Function) {
        this.tou().then((data) => {
            res.send(data)
        }, (err) => next(err));
    }

    tou() {
        return new Promise((resolve, reject) => {
            fs.readFile('../content/tou.txt', 'utf8', (err, data) => {
                (err) ? reject(new http.ValidationError()) : resolve(data);
            });
        })
    }

    privacyRoute(req: http.ApiRequest, res: express.Response, next: Function) {
        this.privacy().then((data) => {
            res.send(data)
        }, (err) => next(err));
    }

    privacy() {
        return new Promise((resolve, reject) => {
            fs.readFile('../content/privacy.txt', 'utf8', (err, data) => {
                (err) ? reject(new http.ValidationError()) : resolve(data);
            });
        })
    }

    constructor(router: express.Router) {
        super(router);
        router.get("/tou", this.touRoute.bind(this));
        router.get("/privacy", this.privacyRoute.bind(this));
    }
}

export let status: StatusRoute;

export default (router: express.Router) => status = new StatusRoute(router); 