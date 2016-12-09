import * as common from './common';
import config from '../config';
import * as nodemailer from 'nodemailer';
import * as ses from 'nodemailer-ses-transport';
import * as ejs from 'ejs';
import * as http from './http'



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
            var html = ejs.renderFile('../content/email/' + template, data);

            var mailOptions = {
                to: to,
                from: 'mibo@mibo.com',
                subject: subject,
                html: html
            }
            EmailManager.transporter.sendMail(mailOptions, (error, info) => {
                error ? reject(error) : resolve(info.response)
            });

        })
    }

}

EmailManager.initTransport();

export default (new EmailManager());