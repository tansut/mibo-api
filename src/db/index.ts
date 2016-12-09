import * as process from 'process';
import config from '../config';
import * as mongoose from 'mongoose';
import * as moment from 'moment';
import * as mongodb from 'mongodb';


export interface IDBDocument extends mongoose.Document {

    _meta: {
        created: Date,
        updated?: Date,
        owner?: string | mongoose.Types.ObjectId
    }

    toClient();
}


export class DBSchema extends mongoose.Schema {

    toClient(doc: IDBDocument) {
        var result = doc.toObject();
        delete result['__v'];
        delete result['_meta'];
        return result;
    }

    preSave(doc: IDBDocument, next: Function) {
        try {
            if (!doc.isNew) {
                doc._meta.updated = moment.utc().toDate();
            } else {
                // Volkan: Current User
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
            return self.preSave.apply(self, [this, next]);
        });
        this.method('toClient', function () {
            return self.toClient.apply(self, [this]);
        });
    }
}


export interface DBModel<T extends IDBDocument> extends mongoose.Model<T> {

}

export class DBManager {
    public connection: mongoose.Connection;

    connect() {
        return new Promise((resolve, reject) => {
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

            this.connection = mongoose.createConnection(connStr);
            this.connection.on('connected', () => {
                require('./models').default.use(this);
                resolve();
            })

            this.connection.on('error', (err) => {
                reject(err);
            })
        });

    }

    constructor() {
        //mongoose.set('debug', true);
        (<any>mongoose).Promise = global.Promise;

    }
}

export default new DBManager();