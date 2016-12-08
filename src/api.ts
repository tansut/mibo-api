import * as express from 'express';
import * as bp from 'body-parser';
import * as http from "http";
import config from "./config";
import apiRoutes from './route/api';
import apiMiddlewares from './middleware/api';
import db from './db';
import stripe from './lib/stripe';

export class ApiApp {
    app: express.Application;
    router: express.Router;

    constructor() {

    }

    bootstrap() {
        this.app = express();
        this.router = express.Router();

        this.app.use(bp.urlencoded({ extended: true }));
        this.app.use(bp.json())
        this.app.use(bp.text());
        this.app.use(bp.raw());

        db.connect();
        stripe.init();

        apiMiddlewares.use(this.app);

        apiRoutes.use(this.router);
        this.app.use('/api/v1', this.router);

        const server = http.createServer(this.app);

        server.listen(config.port);

        server.on("error", (e: Error) => {
            console.log("Error starting server:" + e);
        });

        server.on("listening", () => {
            console.log("Server started on port " + config.port);
        });

        this.app.use((err: any, req: express.Request, res: express.Response, next: Function) => {
            if (err) {
                debugger;
            }
            next(err);
        })
    }
}

export var App: ApiApp;

export default () => (App = new ApiApp());




