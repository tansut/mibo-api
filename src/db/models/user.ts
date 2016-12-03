import * as _ from 'lodash';
import * as stream from 'stream';
import * as mongoose from 'mongoose';
import { DBModel, DBSchema, IDBDocument } from '../';
import * as validator from 'validator';


export const UserRoles = {
    admin: 'admin',
    dietition: 'dietition',
    user: 'user'
}

interface IUser {
    inRole(role: string): boolean;
}

export class User {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    lastLogin: Date;
    roles: Array<string>;
}


export interface UserDocument extends User, IUser, IDBDocument { }

class Schema extends DBSchema {

    inRole(doc: User, role: string) {
        return doc.roles.find((item) => item == role) != undefined;
    }

    toClient(doc: IDBDocument) {
        var result = <User>super.toClient(doc);
        delete result.password;
        return result;
    }

    constructor(definition?: mongoose.SchemaDefinition, options?: mongoose.SchemaOptions) {
        let meta = DBSchema.getMetaDefinition();
        super(definition, options);
        var self = this;
        this.method('inRole', function (role) {
            return self.inRole.apply(self, [this, role]);
        });
    }
}

export const UserSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, validate: validator.isEmail },
    password: { type: String, required: true },
    roles: [{ type: String, enum: [UserRoles.admin, UserRoles.dietition, UserRoles.user], default: [UserRoles.user] }],
    lastLogin: { type: Date, required: false }
});


UserSchema.index({ 'email': 1 }, { unique: true });

export var UserModel: DBModel<UserDocument>;

export default (conn: mongoose.Connection) => (UserModel = conn.model<UserDocument>('user', UserSchema));