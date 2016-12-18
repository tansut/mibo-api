import * as express from "express";

export default class RouteLoader {
    static use(router?: express.Router) {
        return [
            require('./resetpassword').init(router),
            require('./register').init(router),
            require('./coachsignup').init(router)
        ]
    }
}
