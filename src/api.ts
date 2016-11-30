import * as express from 'express';
import * as bp from 'body-parser';
import * as http from "http";
import config from "./config";
import apiRoutes from './route/api';
import apiMiddlewares from './middleware/api';
import db from './db';

class ApiApp {
    app: express.Application;
    router: express.Router;

    constructor() {

    }

    bootstrap() {
        this.app = express();
        this.router = express.Router();

        this.app.use(bp.urlencoded({ extended: true }));
        this.app.use(bp.json())
        db.connect();


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
    }
}

export var App: ApiApp;

export default () => (App = new ApiApp());




