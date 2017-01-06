import * as console from 'console';
import { UserDocument } from '../../db/models/user';
import { ConsultantCreateModel, ChatCreateModel } from '../../models/account';
import { ChatDocument, ChatModel, ChatStatus } from '../../db/models/chat';
import { ConsultantDocument, ConsultantModel } from '../../db/models/consultant';
import UserRoute from './user';
import { Auth } from '../../lib/common';
import * as stream from 'stream';
import { default as ApiBase, IRequestParams } from '../baserouter';
import * as express from 'express';
import * as http from '../../lib/http';
import * as validator from 'validator';
import * as moment from 'moment';
import * as common from '../../lib/common';
import CrudRoute from './crud';
import { CrudOperation } from './crud';
import * as _ from 'lodash';
import ConsultantRoute from './consultant';
import emailmanager from '../../lib/email';


interface UserChatSummary {
    role: string;
    count: number;
    last: Date;
    status: string;
    consultant: {
        _id: string;
        firstName: string;
        lastName: string
    }
}

interface ConsultantChatSummary {
    user: UserDocument;
    count: number;
    last: Date;
    role: string;
    status: string;
}

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

    deleteByUser(user: UserDocument) {
        return this.model.remove({
            user: user._id
        });
    }

    deleteByConsultant(consultant: ConsultantDocument) {
        return this.model.remove({
            consultant: consultant._id
        });
    }

    create(doc: ChatCreateModel): Promise<ChatDocument> {
        var userid = this.req ? (this.req.user ? this.req.user._id.toString() : undefined) : undefined;
        _.extend(doc, {
            start: moment.utc().toDate(),
            initializedBy: userid,
            status: doc.status || ChatStatus.started
        })
        if (doc.status == ChatStatus.assigned) {

            //
            //             var consultantRoute = new ConsultantRoute(this.constructorParams);
            //             var userRoute = new UserRoute(this.constructorParams);

            //             consultantRoute.retrieveUser(doc.consultant, {
            //                 disableOwnership: true
            //             }).then((user) => {
            //                 return consultantRoute.retrieve(doc.consultant, {
            //                     disableOwnership: true
            //                 }).then((consult) => {
            //                     var consultRole = consult.role;
            //                     return emailmanager.send(user.email, 'MiBo - New Consultant!', 'userconsultantnotice.ejs', {
            //                         title: 'Congrats!',
            //                         role: consultRole
            //                     }).then(() => {
            //                         return emailmanager.send(consultantEmail, 'MiBo - New Client!', 'consultantnotice.ejs', {
            //                             title: 'New Client!',
            //                             nickName: user.nickName
            //                         }).then(() => this.insertDb(doc));
            //                     })
            //                 })
            //             })

            return this.insertDb(doc);
        }
        else return this.insertDb(doc);
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

    getSummaryChatsOfConsultant(consultantid: string, userid?: string, role?: string) {
        var consultantRoute = new ConsultantRoute(this.constructorParams);
        return consultantRoute.retrieve(consultantid).then((consultant) => this.getChatsOfConsultant(consultant, userid, role).then((chats) => {
            var result: Array<ConsultantChatSummary> = [];
            var promiseList = [];
            var group = _.groupBy(chats, 'user.id');
            Object.keys(group).forEach((key) => {
                let list = group[key];
                let dateSorted = _.sortBy(list, 'start', 'desc');
                let lastChat = dateSorted[0];
                promiseList.push(
                    this.userRoute.retrieve(lastChat.user, {
                        disableOwnership: true
                    }).then((user) => {
                        return <ConsultantChatSummary>{
                            role: lastChat.role,
                            user: user.toClient(),
                            count: list.length,
                            last: lastChat.start,
                            status: lastChat.status
                        }
                    }));
            })
            return new Promise((resolve, reject) => {
                Promise.all(promiseList).then((results: Array<ConsultantChatSummary>) => {
                    resolve(results)
                }).catch((err) => reject(err))
            });
        }));
    };


    getSummaryChatsOfConsultantRoute() {

        return this.getSummaryChatsOfConsultant(this.req.params.consultantid, this.req.query.userid, this.req.query.role).then((res) => this.res.send(res));

    }

    getSummaryChatsOfUser(userid: string, consultantid: string, role: string) {
        return this.userRoute.retrieve(userid).then((user) => this.getChatsOfUser(user, consultantid, role).then((chats) => {
            var consultantRoute = new ConsultantRoute(this.constructorParams);
            var result: Array<UserChatSummary> = [];
            var promiseList = [];
            var group = _.groupBy(chats, 'role');
            Object.keys(group).forEach((key) => {
                let list = group[key];
                let dateSorted = _.sortBy(list, 'start', 'desc');
                let lastChat = dateSorted[0];
                promiseList.push(
                    consultantRoute.retrieve(lastChat.consultant).then((consultant) => {
                        return <UserChatSummary>{
                            role: key,
                            last: lastChat.start,
                            status: lastChat.status,
                            count: list.length,
                            consultant: consultant.toClient()
                        }
                    }));

            })
            return new Promise((resolve, reject) => {
                Promise.all(promiseList).then((results: Array<UserChatSummary>) => {
                    resolve(results)
                }).catch((err) => reject(err))
            });
        }));
    }

    getSummaryChatsOfUserRoute() {
        return this.getSummaryChatsOfUser(this.req.params.userid, this.req.query.consultantid, this.req.query.role).then((result) => this.res.send(result))
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


