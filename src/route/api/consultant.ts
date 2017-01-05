import { ObjectID } from 'mongodb';
import { UserDocument } from '../../db/models/user';
import { ConsultantCreateModel } from '../../models/account';
import { ConsultantDocument, ConsultantModel } from '../../db/models/consultant';
import UserRoute from './user';
import { Auth } from '../../lib/common';
import * as stream from 'stream';
import { default as ApiBase, IRequestParams } from '../baserouter';
import * as express from 'express';
import * as http from '../../lib/http';
import * as validator from 'validator';
import * as common from '../../lib/common';
import CrudRoute from './crud';
import { CrudOperation, RetrieveOptions } from './crud';
import ChatRoute from './chatapi';
import config from '../../config';
import * as _ from 'lodash';

export default class Route extends CrudRoute<ConsultantDocument> {

    private userRoute: UserRoute;

    searchConsultantRoute() {
        var promise = this.req.query.userid ? this.userRoute.retrieve(this.req.query.userid) : Promise.resolve(null);
        return promise.then((user) => {
            var q = this.model.find();
            if (user)
                q.where('user', (<UserDocument>user)._id)
            return q.then((results) => this.res.send(results.map((consultant) => consultant.toClient())));
        })

    }

    validateDocumentOwnership(doc: ConsultantDocument, op: CrudOperation) {
        if (op == CrudOperation.read)
            return Promise.resolve(doc);
        return super.validateDocumentOwnership(doc, op);
    }

    create(doc: ConsultantCreateModel, ownerUser?: UserDocument): Promise<ConsultantDocument> {
        if (ownerUser)
            doc['_meta'] = {
                owner: ownerUser._id
            }
        return this.insertDb(doc);
    }

    retrieveUser(consultantid: string | ObjectID, options?: RetrieveOptions) {
        return this.retrieve(consultantid, options).then((consultant) => {
            return this.userRoute.retrieve(consultant.user, options);
        })
    }

    delete(doc: ConsultantDocument) {
        var chatRoute = new ChatRoute()
        return chatRoute.deleteByConsultant(doc).then(() => super.delete(doc));
    }

    deleteByUser(user: UserDocument) {
        return this.model.find().where('user', user._id).then((docs) => {
            return Promise.all(docs.map((doc) => this.delete(doc)));
        })
    }

    locate(role: string) {
        var q = this.model.find().where('active', true);
        role && q.where('role', role);
        return q.then((list: Array<ConsultantDocument>) => {
            let item = undefined;
            if (config.nodeenv == 'stage') {
                if (this.req && this.req.user.email.indexOf('mibo.io') >= 0) {
                    item = _.find(list, (i) => i.firstName == 'Mibo');
                }
            }
            item = item || list.length > 0 ? list[0].toClient() : undefined;
            return item;
        })
    }

    locateRoute() {
        return this.locate(this.req.query.role).then((data) => this.res.send(data));
    }

    statusupdate(consultantid: string, newStatus: boolean) {
        return this.retrieve(consultantid).then((doc) => {
            doc.active = newStatus;
            return doc.save();
        })
    }

    statusupdateRoute() {
        return this.statusupdate(this.req.params.consultantid, this.req.body.active).then((data) => this.res.sendStatus(200));
    }

    constructor(reqParams?: IRequestParams) {
        super(reqParams, ConsultantModel);
        this.userRoute = new UserRoute(reqParams);
    }

    static SetRoutes(router: express.Router) {
        router.get("/consultant/locate", Route.BindRequest('locateRoute'));
        router.post("/consultant/:consultantid/statusupdate", Route.BindRequest('statusupdateRoute'));
        router.get("/consultant/search", Route.BindRequest('searchConsultantRoute'));

        Route.SetCrudRoutes(`/consultant`, router, {
            retrieve: true
        })
    }
}


