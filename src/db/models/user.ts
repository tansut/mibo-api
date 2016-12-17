import { key } from 'nconf';
import * as _ from 'lodash';
import * as stream from 'stream';
import * as mongoose from 'mongoose';
import { DBModel, DBSchema, IDBDocument } from '../';
import * as validator from 'validator';
import * as common from '../../lib/common';
import * as stripe from '../../lib/stripe';
import * as sinch from '../../lib/sinch';
import * as authorization from '../../lib/authorizationToken';
import * as moment from 'moment';




export const Verifications = {
    email: 'email',
    mobile: 'mobile'
}

export interface Verification {
    verificationDate: Date
}

export interface Verifications {
    email?: Verification,
    phone?: Verification
}

export interface Integrations {
    stripe: stripe.UserData,
    sinch: sinch.UserData
}


interface IUser {
    inRole(role: string): boolean;
    generateAccessToken(): authorization.IAccessTokenData;

}

export class User {
    nickName?: string;
    email: string;
    password: string;
    lastLogin?: Date;
    roles: Array<string>;
    resetToken?: string;
    resetTokenValid?: Date;
    verifications?: Verifications;
    integrations?: Integrations
    ivCode: string;
}


export interface UserDocument extends User, IUser, IDBDocument { }

class Schema extends DBSchema {

    generateAccessToken(doc: UserDocument): authorization.IAccessTokenData {
        var tokenData = <authorization.IAccessTokenData>{
            userId: doc._id,
            expiration_time: moment().add('minute', 30).toDate(),
            props: []
        };
        return tokenData;
    }

    preSave(doc: IDBDocument, next: Function) {

        if (doc.isNew) {
            var id = mongoose.Types.ObjectId();
            doc._id = id;
            doc._meta.owner = id;
        }

        super.preSave(doc, next);
    }

    inRole(doc: User, role: string) {
        return doc.roles.find((item) => item == role) != undefined;
    }

    toClient(doc: IDBDocument) {
        var result = <User>super.toClient(doc);
        delete result.password;
        delete result.ivCode;
        delete result.integrations;
        delete result.resetToken;
        delete result.resetTokenValid;
        delete result.verifications;
        return result;
    }

    constructor(definition?: mongoose.SchemaDefinition, options?: mongoose.SchemaOptions) {
        let meta = DBSchema.getMetaDefinition();
        super(definition, options);
        var self = this;
        this.method('inRole', function (role) {
            return self.inRole.apply(self, [this, role]);
        });
        this.method('generateAccessToken', function () {
            return self.generateAccessToken.apply(self, [this]);
        });
    }
}

export const UserSchema = new Schema({
    nickName: { type: String, required: false },
    email: { type: String, required: true, validate: validator.isEmail },
    password: { type: String, required: true },
    roles: [{ type: String, enum: [common.UserRoles.admin, common.UserRoles.dietitian, common.UserRoles.user], default: [common.UserRoles.user] }],
    lastLogin: { type: Date, required: false },
    resetToken: { type: String, required: false },
    resetTokenValid: { type: Date, required: false },
    verifications: { email: { type: Object, required: false }, mobile: { type: Object, required: false } },
    integrations: { stripe: { type: Object, required: false }, sinch: { type: Object, required: false } },
    ivCode: { type: String, required: true }
});


UserSchema.index({ 'email': 1 }, { unique: true });

export let UserModel: DBModel<UserDocument>;

export default (conn: mongoose.Connection) => (UserModel = conn.model<UserDocument>('user', UserSchema));
