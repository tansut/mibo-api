import config from '../config';
import * as mongoose from 'mongoose';
import * as moment from 'moment';
import * as mongodb from 'mongodb';


export interface DBDocument extends mongoose.Document {
    _meta: {
        created: Date,
        updated?: Date,
        owner?: string | mongoose.Types.ObjectId
    }
}


export class DBSchema extends mongoose.Schema {

    preSave(doc: DBDocument, next: Function) {
        try {
            if (!doc.isNew) {
                doc._meta.updated = moment.utc().toDate();
            } else {
                doc._meta.owner = mongoose.Types.ObjectId.createFromHexString("583f3e65b6db002ce969e714");
            }
            next();
        } catch (err) {
            next(err)
        }
    }

    static getMetaDefinition(): mongoose.SchemaDefinition {
        return {
            created: { type: Date, required: true, default: moment.utc },
            updated: { type: Date, required: false },
            owner: { type: mongoose.Schema['ObjectId'], required: false, ref: 'Users' }
        }
    }

    constructor(definition?: mongoose.SchemaDefinition, options?: mongoose.SchemaOptions) {
        definition['_meta'] || (definition['_meta'] = DBSchema.getMetaDefinition());
        super(definition, options);
        var self = this;
        this.pre('save', function (next: Function) {
            self.preSave.apply(self, [this, next]);
        });
    }

}



export interface DBModel<T extends DBDocument> extends mongoose.Model<T> {

}

export class DBManager {
    public connection: mongoose.Connection;

    connect() {
        var options = config.dbuser ? {
            user: config.dbuser,
            pwd: config.dbpwd ? new Buffer(config.dbpwd, 'base64').toString('ascii') : '',
            auth: {
                authdb: config.authdb ? config.authdb : 'admin'
            }
        }
            : undefined;

        var connStr = options ? 'mongodb://' + options.user + ':' + options.pwd + '@' + config.dbaddress + ':' + config.dbport + '/' + config.dbname
            : 'mongodb://' + config.dbaddress + ':' + config.dbport + '/' + config.dbname;

        (<any>mongoose).Promise = global.Promise;

        this.connection = mongoose.createConnection(connStr);

        require('./models').default.use(this);
    }
    constructor() {

    }
}

export default new DBManager();