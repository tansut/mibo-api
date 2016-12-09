import ApiBase from './base';
import * as express from "express";
import * as http from '../../lib/http';
import * as validator from 'validator';
import * as common from '../../lib/common';


class Route extends ApiBase {

    status() {
        return new Promise((resolve, reject) => {
            resolve('Oh yeah!');
        });
    }

    statusRoute(req: http.ApiRequest, res: express.Response, next: Function) {
        this.status().then((data) => res.send(data)).catch((err) => next(err));
    }

    constructor(router: express.Router) {
        super(router);
        router.get("/status", this.statusRoute.bind(this));
    }
}

let route: Route;
export function init(router: express.Router) { route = new Route(router) };

export default route; 