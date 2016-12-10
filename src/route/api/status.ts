import * as stream from 'stream';
import ApiBase from './base';
import * as express from "express";
import * as http from '../../lib/http';
import * as validator from 'validator';
import * as common from '../../lib/common';


export default class Route extends ApiBase {

    status() {
        return new Promise((resolve, reject) => {
            resolve('Oh yeah!');
        });
    }

    statusRoute() {
        return this.status().then((data) => this.res.send(data));
    }

    static SetRoutes(router: express.Router) {
        router.get("/status", Route.BindRequest('statusRoute'));
    }
}


