import { UserModel } from '../../db/models/user';
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

    render(req: http.ApiRequest, res: express.Response, next: Function) {
        var token = "xxxx";
        //UserModel.findOne().where()
        res.render('account/resetpassword', {
            title: 'foo'
        })
    }

    constructor(router?: express.Router) {
        super(router);
        this.router && this.router.get("/account/resetpassword", this.render.bind(this));
    }
}

export let route: Route;
export function init(router?: express.Router) { route = new Route(router) };

