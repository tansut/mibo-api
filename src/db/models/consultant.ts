import { UserRoles } from '../../lib/common';
import { ObjectID } from 'mongodb';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as stream from 'stream';
import * as mongoose from 'mongoose';
import { DBModel, DBSchema, IDBDocument } from '../';
import * as validator from 'validator';
import * as crypto from 'crypto';
import { UserDocument } from './user';



export class Consultant {
    firstName: string;
    lastName: string;
    user: string | ObjectID;
    active: boolean;
    role: string;
}

export interface ConsultantDocument extends Consultant, IDBDocument { }

class ConsultantConfig extends DBSchema {

    toClient(doc: IDBDocument) {
        var result = <Consultant>super.toClient(doc);
        return result;
    }

    constructor(definition?: mongoose.SchemaDefinition, options?: mongoose.SchemaOptions) {
        super(definition, options);
        var self = this;
    }
}

export const ConsultantSchema = new ConsultantConfig({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    user: { type: mongoose.Schema['ObjectId'], required: true, ref: 'Users' },
    active: { type: Boolean, required: true, default: true },
    role: { type: String, required: true, enum: [UserRoles.dietitian, UserRoles.sales] }
});

ConsultantSchema.index({ 'user': 1, 'role': 1 }, { unique: true });

export var ConsultantModel: DBModel<ConsultantDocument>;

export default (conn: mongoose.Connection) => (ConsultantModel = conn.model<ConsultantDocument>('consultant', ConsultantSchema));