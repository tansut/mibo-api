import * as express from 'express';
import * as http from "http";
import config from "./config";
import apiRoutes from './route/api';
import apiMiddlewares from './middleware/api';
import db from './db';

const app = express();
const apiRouter = express.Router();

db.connect();

apiMiddlewares.use(app);

apiRoutes.use(apiRouter);
app.use('/api/v1', apiRouter);

const server = http.createServer(app);

server.listen(config.port);

server.on("error", (e: Error) => {
    console.log("Error starting server:" + e);
});

server.on("listening", () => {
    console.log("Server started on port " + config.port);
});

