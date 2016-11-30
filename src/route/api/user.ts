import { request } from 'https';
import * as express from "express";
import * as requests from '../../lib/api.request';
import ApiBase from './base';
import { User, IUser } from '../../db/models/user';
import CrudRoute from './crud';


class UserRoute extends CrudRoute<IUser> {

    constructor(router: express.Router) {
        super(router, User, '/user');
    }
}

export var user: UserRoute;

export default (router: express.Router) => user = new UserRoute(router); 