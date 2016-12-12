import { ConsultantDocument, ConsultantModel } from '../../db/models/consultant';
import UserRoute from './user';
import { Auth } from '../../lib/common';
import * as stream from 'stream';
import { default as ApiBase, IRequestParams } from './base';
import * as express from 'express';
import * as http from '../../lib/http';
import * as validator from 'validator';
import * as common from '../../lib/common';
import CrudRoute from './crud';



export default class Route extends CrudRoute<ConsultantDocument> {

    private userRoute: UserRoute;

    locate(role: string) {
        var q = this.model.find().where('active', true);
        debugger;
        role && q.where('role', role);
        return q.then((list: Array<ConsultantDocument>) => {
            let item = list.length > 0 ? list[0].toClient() : undefined;
            // return list.map((item) => item.toClient());
            return item;
        })
    }

    locateRoute() {
        return this.locate(this.req.query.role).then((data) => this.res.send(data));
    }

    constructor(reqParams?: IRequestParams) {
        super(reqParams, ConsultantModel);
        this.userRoute = new UserRoute(reqParams);
    }

    static SetRoutes(router: express.Router) {
        router.get("/consultant/locate", Route.BindRequest('locateRoute'));
    }



}


