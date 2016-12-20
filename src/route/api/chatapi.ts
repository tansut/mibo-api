import { UserDocument } from '../../db/models/user';
import { ConsultantCreateModel, ChatCreateModel } from '../../models/account';
import { ChatModel, ChatDocument } from '../../db/models/chat';
import { ConsultantDocument, ConsultantModel } from '../../db/models/consultant';
import UserRoute from './user';
import { Auth } from '../../lib/common';
import * as stream from 'stream';
import { default as ApiBase, IRequestParams } from './base';
import * as express from 'express';
import * as http from '../../lib/http';
import * as validator from 'validator';
import * as moment from 'moment';
import * as common from '../../lib/common';
import CrudRoute from './crud';
import { CrudOperation } from './crud';
import * as _ from 'lodash';
import ConsultantRoute from './consultant';

export default class ChatRoute extends CrudRoute<ChatDocument> {

    private userRoute: UserRoute;

    validateDocumentOwnership(doc: ChatDocument, op: CrudOperation) {
        var success = super.validateDocumentOwnership(doc, op);
        return new Promise((resolve, reject) => {
            success.then(() => resolve()).catch(() => {
                var userid = this.req.user._id.toString();
                if (userid == doc.user || userid == doc.consultant)
                    resolve();
                else reject(new http.PermissionError());
            })
        });
    }

    create(doc: ChatCreateModel): Promise<ChatDocument> {
        _.extend(doc, {
            start: moment.utc().toDate()
        })
        return this.insertDb(doc);
    }

    endChat(doc: ChatDocument) {
        doc.finish = moment.utc().toDate();
        return doc.save();
    }

    endChatRouter() {
        return this.retrieve(this.req.params.chatid).then((Chat => this.endChat(Chat).then(() => this.res.send({
            finish: Chat.finish
        }))));
    }

    getChatsOfUser(user: UserDocument, forConsultant?: string, forRole?: string) {
        var base = this.model.find({
            user: user._id
        }).sort({ start: -1 });
        if (forConsultant)
            base.where('consultant', forConsultant);
        if (forRole)
            base.where('role', forRole);
        return base;
    }



    getChatsOfConsultant(consultant: ConsultantDocument, forUser?: string, forRole?: string) {
        var base = this.model.find({
            consultant: consultant._id
        }).sort({ start: -1 });
        if (forUser)
            base.where('user', forUser);
        if (forRole)
            base.where('role', forRole);
        return base;
    }

    getChatsOfUserRoute() {
        return this.userRoute.retrieve(this.req.params.userid).then((user) => this.getChatsOfUser(user, this.req.query.consultantid, this.req.query.role).then((Chats) => this.res.send(Chats.map((c) => c.toClient()))));
    }

    getChatsOfConsultantRoute() {
        var consultantRoute = new ConsultantRoute(this.constructorParams);
        return consultantRoute.retrieve(this.req.params.consultantid).then((consultant) => this.getChatsOfConsultant(consultant, this.req.query.userid, this.req.query.role).then((Chats) => this.res.send(Chats.map((c) => c.toClient()))));
    }

    getSummaryChatsOfUserRoute() {
        return this.userRoute.retrieve(this.req.params.userid).then((user) => this.getChatsOfUser(user, this.req.query.consultantid, this.req.query.role).then((Chats) => {
            return Chats.map((Chat) => {
                return Chat;
            })
        }));
    }

    locate(role: string) {
        var q = this.model.find().where('active', true);
        role && q.where('role', role);
        return q.then((list: Array<ChatDocument>) => {
            let item = list.length > 0 ? list[0].toClient() : undefined;
            return item;
        })
    }


    constructor(reqParams?: IRequestParams) {
        var model = ChatModel;
        super(reqParams, ChatModel);
        this.userRoute = new UserRoute(reqParams);
    }

    static SetRoutes(router: express.Router) {
        ChatRoute.SetCrudRoutes('/chat', router, {
            retrieve: true,
            create: true
        });

        router.post("/chat/:chatid/end", ChatRoute.BindRequest('endChatRouter'));
        router.get("/chat/search/consultant/:consultantid", ChatRoute.BindRequest('getChatsOfConsultantRoute'));
        router.get("/chat/search/user/:userid", ChatRoute.BindRequest('getChatsOfUserRoute'));
        router.get("/chat/search/user/:userid/summary", ChatRoute.BindRequest('getSummaryChatsOfUserRoute'));
        router.get("/chat/search/consultant/:consultantid/summary", ChatRoute.BindRequest('getSummaryChatsOfConsultantRoute'));
    }
}


