import { request } from 'https';
import * as express from "express";
import * as http from '../../lib/http';
import ApiBase from './base';
import { UserModel } from '../../db/models/user';
import * as fs from 'fs';


export default class Route extends ApiBase {

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

    static SetRoutes(router: express.Router) {
        router.get("/tou", Route.BindRequest('touRoute'));
        router.get("/privacy", Route.BindRequest('privacyRoute'));
    }

    constructor() {
        super();
    }
}