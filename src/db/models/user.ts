import * as mongoose from 'mongoose';
import { DBDocument, DBModel, DBSchema } from '../';

export interface IUser extends DBDocument {
    firstName: string;
    lastName: string;
    email: string;
}

export const Schema = new DBSchema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true }
});

export var User: DBModel<IUser>;

export default (conn: mongoose.Connection) => (User = conn.model<IUser>('user', Schema));