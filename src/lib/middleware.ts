import * as stream from 'stream';
import * as express from "express";



export default class Middleware {

    private static instanceList = {};

    private static Register(key: string, instance: Middleware) {
        Middleware.instanceList[key] = instance;
    }

    protected constructor(public app: express.Application) {

    }
}