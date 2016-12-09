import { request } from 'https';
import * as express from "express";
import * as http from '../../lib/http';
import ApiBase from './base';
import { UserModel } from '../../db/models/user';
import * as fs from 'fs';


class Route extends ApiBase {

    tou(req: http.ApiRequest, res: express.Response, next: Function) {
        fs.readFile('../src/content/tou.txt', 'utf8', (err, data) => {
            if (err) {
                return next(err)
            }
            res.send(data);
        })
    }

    constructor(router: express.Router) {
        super(router);
        router.get("/tou", this.tou.bind(this));
    }
}

let route: Route;
export function init(router: express.Router) { route = new Route(router) };

export default route; 