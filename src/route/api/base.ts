import * as express from "express";
import { auth } from '../../middleware/api/auth';


export default class ApiRoute {

    authenticate(req, res, next) {
        return auth.force(req, res, next);
    }

    constructor(public router: express.Router) {

    }
}