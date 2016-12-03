import * as http from '../../lib/http';
import * as express from "express";
import { auth } from '../../middleware/api/auth';

export enum ResponseStatus {
    success = 0,
    warning = 1,
    error = 2
}

export interface ApiResponse {
    $status: ResponseStatus,
    result?: any;
}

export default class ApiRoute {

    authenticate(req, res, next) {
        return auth.force(req, res, next);
    }

    constructor(public router: express.Router) {

    }
}