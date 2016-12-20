import { UserRoles } from '../../lib/common';
import { ObjectID } from 'mongodb';
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import { DBModel, DBSchema, IDBDocument } from '../';


export class Chat {
    user: string | ObjectID;
    consultant: string | ObjectID;
    start: Date;
    finish: Date;
    role: string;
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
    role: { type: String, required: true, enum: [UserRoles.dietitian, UserRoles.sales, UserRoles.therapist, UserRoles.trainer] }
});

ChatSchema.index({ 'user': 1, 'consultant': 1 });

export var ChatModel: DBModel<ChatDocument>;



export default (conn: mongoose.Connection) => {
    ChatModel = conn.model<ChatDocument>('chat', ChatSchema);
};