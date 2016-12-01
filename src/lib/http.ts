
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
    constructor() {
        super(401, 'unauthorized');
    }
}

export class NotFoundError extends HttpError {
    constructor() {
        super(404, 'notfound');
    }
}

export interface ApiRequest extends express.Request {
    user: any;
}