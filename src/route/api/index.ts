import * as express from "express";

export default class RouteLoader {
    static use(router?: express.Router) {
        return [
            require('./status').init(router),
            require('./user').init(router),
            require('./system').init(router),
            require('./payment').init(router)
        ]
    }
}
