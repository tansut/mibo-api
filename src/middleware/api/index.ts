import * as express from "express";

export default class MiddlewareLoader {
    static use(app: express.Application) {
        return [
            require('./auth').default(app)
        ]
    }
}
