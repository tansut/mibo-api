import * as console from 'console';
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

        db.connect().then(() => {
            apiMiddlewares.use(this.app);

            apiRoutes.use(this.router);
            this.app.use('/api/v1', this.router);

            const server = http.createServer(this.app);

            server.listen(config.port, (err) => {
                if (err) {
                    console.log(err);
                    process.exit(2);
                }
            });


            this.app.use((err: any, req: express.Request, res: express.Response, next: Function) => {
                if (err) {
                    debugger;
                }
                next(err);
            })
        }, (err) => {
            console.log(err);
            process.exit(1);
        });


    }
}

export var App: ApiApp;

export default () => (App = new ApiApp());




