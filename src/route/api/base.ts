import { ApiRequest } from '../../lib/api.request';
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

    populateSuccess(result: any): ApiResponse {
        return {
            $status: ResponseStatus.success,
            result: result
        }
    }

    populateError(result: any): ApiResponse {
        return {
            $status: ResponseStatus.error,
            result: result
        }
    }

    populateWarning(result: any): ApiResponse {
        return {
            $status: ResponseStatus.warning,
            result: result
        }
    }

    authenticate(req, res, next) {
        return auth.force(req, res, next);
    }

    constructor(public router: express.Router) {

    }
}