import * as common from './common';
import config from '../config';
import * as nodemailer from 'nodemailer';
import * as ses from 'nodemailer-ses-transport';
import * as ejs from 'ejs';
import * as http from './http'
import * as path from 'path';


class EmailManager {
    static transporter: nodemailer.Transporter;

    static initTransport() {
        this.transporter = nodemailer.createTransport(ses({
            accessKeyId: config.emailAccessKey,
            secretAccessKey: config.emailSecretAccessKey,
            rateLimit: config.emailRateLimit,
            region: 'us-west-2'
        }));
    }



    send(to: string, subject: string, template: string, data?: { [key: string]: any }) {
        return new Promise((resolve, reject) => {
            ejs.renderFile(path.join(__dirname, '../../content/email/' + template), data, {

            }, (err, res) => {
                if (err) return reject(err);
                var mailOptions = {
                    to: to,
                    from: 'PhysioHealth <admin@physioh.com>',
                    subject: subject,
                    html: res
                }
                EmailManager.transporter.sendMail(mailOptions, (error, info) => {
                    error ? reject(error) : resolve(info.response)
                });
            });
        })
    }

}

EmailManager.initTransport();

export default (new EmailManager());