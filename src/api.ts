import * as console from 'console';
import * as express from 'express';
import * as bp from 'body-parser';
import * as http from "http";
import config from "./config";
import apiRoutes from './route/api';
import apiMiddlewares from './middleware/api';
import db from './db';
import stripe from './lib/stripe';
import webRoutes from './route/web';
import * as path from 'path';


export class ApiApp {
    app: express.Application;
    router: express.Router;

    constructor() {

    }

    bootstrap() {
        return new Promise((resolve, reject) => {
            this.app = express();
            this.router = express.Router();

            this.app.use(bp.urlencoded({ extended: true }));
            this.app.use(bp.json())
            this.app.use(bp.text());
            this.app.use(bp.raw());

            this.app.use(express.static(path.join(__dirname, '../public')));

            return db.connect().then(() => {
                apiMiddlewares.use(this.app);
                apiRoutes.use(this.router);
                this.app.use('/api/v1', this.router);

                webRoutes.use(this.router);
                this.app.use('/', this.router);

                var staticPath = path.join(__dirname, '/public');
                this.app.use(express.static(staticPath));
                this.app.set('view engine', 'ejs');
                this.app.set('views', path.join(__dirname, '../views'));

                this.app.use((req, res, next) => {
                    res.status(404).render('404')
                });
                this.app.use((req, res, next) => {
                    res.status(500).render('500')
                });

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

export var App: ApiApp;

export default () => (App = new ApiApp());




