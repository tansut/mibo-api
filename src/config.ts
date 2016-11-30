import * as stream from 'stream';
import { stat } from 'fs';
import { union } from "lodash";
import * as nconf from "nconf";

class Config {
    public static PORT = "PORT";
    public static DBADDRESS = "DBADDRESS";
    public static DBPORT = "DBPORT";
    public static DBNAME = "DBNAME";
    public static DBUSER = "DBUSER";
    public static DBPWD = "DBPWD";
    public static AUTHDB = "AUTHDB";


    public port: number;
    public dbaddress: string;
    public dbport: number;
    public dbname: string;
    public dbuser: string;
    public dbpwd: string;
    public authdb: string;

    public get(key?: string, cb?: nconf.ICallbackFunction) {
        return nconf.get(key, cb);
    }

    constructor() {
        nconf.argv().env();
        this.port = this.get(Config.PORT) || 3000;
        this.dbaddress = this.get(Config.DBADDRESS) || '127.0.0.1';
        this.dbport = this.get(Config.DBPORT) || 27019;
        this.dbname = this.get(Config.DBNAME) || 'mibo';
        this.dbuser = this.get(Config.DBUSER) || '';
        this.dbpwd = this.get(Config.DBPWD) || '';
        this.authdb = this.get(Config.AUTHDB) || 'admin';
    }
}

export default new Config();