import * as stream from 'stream';
import { stat } from 'fs';
import { union } from "lodash";
import * as nconf from "nconf";

class Config {
    public static NODEENV = "NODE_ENV";
    public static PORT = "PORT";
    public static DBADDRESS = "DBADDRESS";
    public static DBPORT = "DBPORT";
    public static DBNAME = "DBNAME";
    public static DBUSER = "DBUSER";
    public static DBPWD = "DBPWD";
    public static AUTHDB = "AUTHDB";
    public static STRIPEAPIKEY = "STRIPEAPIKEY";
    public static STRIPEPUBLICKEY = "STRIPEPUBLICKEY";
    public static SINCHAPIKEY = "SINCHAPIKEY";
    public static EMAILACCESSKEY = "EMAILACCESSKEY";
    public static EMAILSECRETACCESSKEY = "EMAILSECRETACCESSKEY";
    public static EMAILSERVICEURL = "EMAILSERVICEURL";
    public static EMAILRATELIMIT = "EMAILRATELIMIT";
    public static APIURL = "APIURL";
    public static WEBURL = "WEBURL";
    public static ENCKEY = "ENCKEY";

    public nodeenv: string;
    public port: number;
    public dbaddress: string;
    public dbport: number;
    public dbname: string;
    public dbuser: string;
    public dbpwd: string;
    public authdb: string;
    public stripeApi: string;
    public stripePublic: string;
    public sinchApi: string;
    public emailAccessKey: string;
    public emailSecretAccessKey: string;
    public emailServiceUrl: string;
    public emailRateLimit: number;
    public apiUrl: string;
    public webUrl: string;
    public enckey: string;


    public get(key?: string, cb?: nconf.ICallbackFunction) {
        return nconf.get(key, cb);
    }

    constructor() {
        nconf.argv().env();
        this.nodeenv = this.get(Config.NODEENV) || 'development';
        this.port = this.get(Config.PORT) || 3000;
        this.dbaddress = this.get(Config.DBADDRESS) || '127.0.0.1';
        this.dbport = this.get(Config.DBPORT) || 27017;
        this.dbname = this.get(Config.DBNAME) || 'mibo-local';
        this.dbuser = this.get(Config.DBUSER) || '';
        this.dbpwd = this.get(Config.DBPWD) || '';
        this.authdb = this.get(Config.AUTHDB) || 'admin';
        this.stripeApi = this.get(Config.STRIPEAPIKEY) || '';
        this.stripePublic = this.get(Config.STRIPEPUBLICKEY) || '';
        this.sinchApi = this.get(Config.SINCHAPIKEY) || '';
        this.emailAccessKey = this.get(Config.EMAILACCESSKEY) || '';
        this.emailSecretAccessKey = this.get(Config.EMAILSECRETACCESSKEY) || '';
        this.emailServiceUrl = this.get(Config.EMAILSERVICEURL) || '';
        this.emailRateLimit = this.get(Config.EMAILRATELIMIT) || 15;
        this.apiUrl = this.get(Config.APIURL) || 'http://localhost:3001';
        this.webUrl = this.get(Config.WEBURL) || 'http://localhost:3005';
        this.enckey = this.get(Config.ENCKEY);
    }
}

export default new Config();