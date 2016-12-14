import { request } from 'https';
import * as express from "express";
import * as http from '../../lib/http';
import ApiBase from './base';
import { UserModel } from '../../db/models/user';
import * as fs from 'fs';
import { Auth } from '../../lib/common';
import * as path from 'path';


export default class Route extends ApiBase {

    @Auth.Anonymous()
    touRoute() {
        return this.tou().then((data) => this.res.send(data));
    }

    tou() {
        return new Promise((resolve, reject) => {
            fs.readFile(path.join(__dirname, '../../../content/tou.txt'), 'utf8', (err, data) => {
                (err) ? reject(new http.ValidationError()) : resolve(data);
            });
        })
    }

    @Auth.Anonymous()
    privacyRoute() {
        return this.privacy().then((data) =>
            this.res.send(data));
    }

    privacy() {
        return new Promise((resolve, reject) => {
            fs.readFile(path.join(__dirname, '../../../content/privacy.txt'), 'utf8', (err, data) => {
                (err) ? reject(new http.ValidationError()) : resolve(data);
            });
        })
    }

    static SetRoutes(router: express.Router) {
        router.get("/tou", Route.BindRequest('touRoute'));
        router.get("/privacy", Route.BindRequest('privacyRoute'));
    }
}