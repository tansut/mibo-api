import * as mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
    firstName: string;
    lastName: string;
    email: string;
}

export const Schema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true }
});

export var User: mongoose.Model<IUser>;

export default (conn: mongoose.Connection) => (User = conn.model<IUser>('user', Schema));