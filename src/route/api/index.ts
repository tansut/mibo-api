import * as express from "express";

export default class RouteLoader {
    static use(router: express.Router) {
        return [
            require('./status').default(router),
            require('./user').default(router),
            require('./system').default(router),
            require('./payment').default(router)
        ]
    }
}
