import { connect } from 'net';
import config from '../config';
import * as mongoose from 'mongoose';
//import * as mongodb from 'mongodb';


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

        //mongoose.Promise = global.Promise;

        this.connection = mongoose.createConnection(connStr);

        require('./models').default.use(this);
    }
    constructor() {

    }
}

export default new DBManager();