import { UserRoles } from '../../lib/common';
import { ObjectID } from 'mongodb';
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import { DBModel, DBSchema, IDBDocument } from '../';

export const ChatStatus = {
    assigned: 'assigned',
    started: 'started'
}

export const ChatType = {
    text: 'text',
    video: 'video'
}

export interface ChatLog {
    from: string | ObjectID,
    to: string | ObjectID,
    dare: Date;
    contentType: string;
    content: any;
}

export class Chat {
    user: string | ObjectID;
    consultant: string | ObjectID;
    start: Date;
    finish: Date;
    role: string;
    status: string;
    initializedBy: string | ObjectID;
    type: string;
    log: Array<ChatLog>;

}

export interface ChatDocument extends Chat, IDBDocument { }

class Schema extends DBSchema {

    preSave(doc: ChatDocument, next: Function) {
        if (doc.isNew) {
            doc.start = moment.utc().toDate();
        }
        super.preSave(doc, next);
    }

    toClient(doc: IDBDocument) {
        var result = <Chat>super.toClient(doc);
        delete result.log;
        return result;
    }

    constructor(definition?: mongoose.SchemaDefinition, options?: mongoose.SchemaOptions) {
        super(definition, options);
        var self = this;
    }
}

export const ChatSchema = new Schema({
    user: { type: mongoose.Schema['ObjectId'], required: true, ref: 'Users' },
    consultant: { type: mongoose.Schema['ObjectId'], required: true, ref: 'Consultants' },
    start: { type: Date, required: true },
    finish: { type: Date, required: false },
    role: { type: String, required: true, enum: [UserRoles.dietitian, UserRoles.sales, UserRoles.therapist, UserRoles.trainer] },
    status: { type: String, required: true, enum: [ChatStatus.assigned, ChatStatus.started] },
    initializedBy: { type: mongoose.Schema['ObjectId'], required: true, ref: 'Users' },
    type: { type: String, required: true, enum: [ChatType.text, ChatType.video] },
    log: [{ from: mongoose.Schema['ObjectId'], to: mongoose.Schema['ObjectId'], date: Date, contentType: String, content: mongoose.Schema.Types.Mixed }]
});

ChatSchema.index({ 'user': 1, 'consultant': 1 });

export var ChatModel: DBModel<ChatDocument>;



export default (conn: mongoose.Connection) => {
    ChatModel = conn.model<ChatDocument>('chat', ChatSchema);
};