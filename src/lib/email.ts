import * as common from './common';
import config from '../config';
import * as nodemailer from 'nodemailer';
import * as ses from 'nodemailer-ses-transport';



class EmailManager {
    static transporter: nodemailer.Transporter;

    static initTransport() {
        this.transporter = nodemailer.createTransport(ses({
            accessKeyId: config.emailAccessKey,
            secretAccessKey: config.emailSecretAccessKey,
            rateLimit: config.emailRateLimit
        }));
    }

    send(to: string, subject: string, template: string, data?: { [key: string]: any }) {
        return new Promise((resolve, reject) => {
            //TODO: get template, replace with data, send to user;
            resolve();
        })
    }

}

EmailManager.initTransport();

export default (new EmailManager());