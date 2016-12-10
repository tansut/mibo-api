import * as path from 'path';
import * as console from 'console';
import * as express from 'express';
import * as bp from 'body-parser';
import * as http from "http";
import config from "./config";
import webRoutes from './route/web';
// import apiMiddlewares from './middleware/api';
import db from './db';
import stripe from './lib/stripe';

export class WebApp {
    app: express.Application;
    router: express.Router;

    constructor() {

    }

    bootstrap() {
        return new Promise((resolve, reject) => {
            this.app = express();
            this.router = express.Router();

            return db.connect().then(() => {
                //apiMiddlewares.use(this.app);
                webRoutes.use(this.router);
                this.app.use('/', this.router);

                var staticPath = path.join(__dirname, '/public');
                this.app.use(express.static(staticPath));
                this.app.set('view engine', 'ejs');
                this.app.set('views', path.join(__dirname, '../views'));

                const server = http.createServer(this.app);

                this.app.use((err: any, req: express.Request, res: express.Response, next: Function) => {
                    if (err) {
                        debugger;
                    }
                    next(err);
                })

                server.listen(config.port, (err) => {
                    if (err) {
                        console.log(err);
                        process.exit(2);
                    }
                    resolve();
                });



            }, (err) => {
                console.log(err);
                process.exit(1);
            });
        });



    }
}

export var App: WebApp;

export default () => (App = new WebApp());




