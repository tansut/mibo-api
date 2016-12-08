
import * as express from 'express';

export class ApplicationError extends Error {
    protected constructor(public name: string) {
        super();
    }
}

export class BusinessError extends ApplicationError {
    protected constructor(public name: string) {
        super(name);
    }
}

export class TehnicalError extends ApplicationError {
    protected constructor(public name: string) {
        super(name);
    }
}

export class HttpError extends ApplicationError {
    protected constructor(public statusCode: number, public name: string) {
        super(name);
    }
}


export class PermissionError extends HttpError {
    constructor(msg: string = null) {
        super(401, msg || 'unauthorized');
    }
}

export class NotFoundError extends HttpError {
    constructor(msg: string = null) {
        super(404, msg || 'notfound');
    }
}

export class ValidationError extends HttpError {
    constructor(msg: string = null) {
        super(422, msg || 'invaliddata');
    }
}

export interface ApiRequest extends express.Request {
    user: any;
}