import * as express from "express";

//let appRoutes = './status', './user'
export default class RouteLoader {
    static use(router?: express.Router) {
        return [
            require('./status').default.SetRoutes(router),
            require('./user').init(router),
            require('./system').init(router),
            require('./payment').init(router)
        ]
    }
}
