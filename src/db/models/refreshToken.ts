import * as _ from 'lodash';
import * as moment from 'moment';
import * as stream from 'stream';
import * as mongoose from 'mongoose';
import { DBModel, DBSchema, IDBDocument } from '../';
import * as validator from 'validator';
import * as crypto from 'crypto';
import { UserDocument } from './user';


export interface IRefreshToken { 
}


export class RefreshToken {
    token: string;
    tag: Buffer;
    userId: string;
}

export interface RefreshTokenDocument extends RefreshToken, IRefreshToken, IDBDocument { }

class RefreshTokenSchemaConfig extends DBSchema {

    toClient(doc: IDBDocument): IDBDocument {
        throw new Error("Refresh Token Cannot Be Sent To Client.");
    }

    constructor(definition?: mongoose.SchemaDefinition, options?: mongoose.SchemaOptions) {
        super(definition, options);
        var self = this;
    }
}

export const RefreshTokenSchema = new RefreshTokenSchemaConfig({
    token : { type : String , required : true },
    tag : { type : Buffer , required : true },
    userId : { type : String , required : true },
});


export var RefreshTokenModel: DBModel<RefreshTokenDocument>;

export default (conn: mongoose.Connection) => (RefreshTokenModel = conn.model<RefreshTokenDocument>('refreshtoken', RefreshTokenSchema));