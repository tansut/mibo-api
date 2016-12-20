import * as express from 'express';

export default class PageRenderer {
    static renderPage(res: express.Response, template: string, title: string, status?: string, resetToken?: string) {
        if (resetToken && !status) {
            res.render(template, {
                title: title,
                resetToken: resetToken
            });
        }
        if (status && !resetToken) {
            res.render(template, {
                title: title,
                status: status
            });
        }
        res.render(template, {
            title: title,
            status: status,
            resetToken: resetToken
        });
    }
}