import { SignupModel } from '../../models/account';
import { UserModel } from '../../db/models/user';
import WebBase from './base';
import * as express from "express";
import * as http from '../../lib/http';
import * as validator from 'validator';
import * as common from '../../lib/common';
import * as moment from 'moment';
import * as bcrypt from 'bcryptjs';
import UserRoute from '../api/user';
import emailmanager from '../../lib/email';
import PageRenderer from './renderer';
import { Auth } from '../../lib/common';
import * as StripeLib from 'stripe';
import config from '../../config';

let lib = StripeLib(config.stripeApi);

export default class Route extends WebBase {

    errStatus = {
        stripeErr: 'stripeErr',
        planErr: 'planErr',
        success: 'success'
    }

    @Auth.Anonymous()
    stripeSubscriptionRoute() {
        var plan = this.req.query.plan;
        if (typeof plan === 'undefined' || plan.length == 0) {
            this.res.sendStatus(401);
        } else {
            return lib.plans.retrieve(plan).then((results) => {
                this.res.render('account/stripe', {
                    title: 'MiBo Subscriptions',
                    planName: results.name,
                    planAmount: results.amount,
                    planCurrency: results.currency,
                    status: 'init',
                    planId: results.id
                });
            }).catch((err) => {
                this.res.render('account/stripe', {
                    title: 'Error',
                    status: this.errStatus.planErr
                });
            });
        }
    }

    @Auth.Anonymous()
    purchaseRoute() {
        return lib.plans.retrieve(this.req.body.planid).then((result) => {
            return lib.charges.create({
                amount: result.amount,
                currency: result.currency,
                source: this.req.body.stripeToken,
                description: "Customer Charged for " + result.name
            }, (err, charge) => {
                if (err) {
                    this.res.render('account/stripe', {
                        title: 'Subscription Completed',
                        status: this.errStatus.stripeErr,
                        planName: result.name
                    });
                }
                emailmanager.send('hello@wellbit.io', 'MiBo - New Purchase Notification', 'purchase.ejs', {
                    title: 'New Plan Purchase',
                    plan: charge.description,
                    amount: charge.amount,
                    currency: charge.currency,
                    email: charge.source.name
                });
                emailmanager.send(charge.source.name, 'MiBo - Your Subscription', 'purchase.ejs', {
                    title: 'Your Subscription',
                    amount: charge.amount,
                    currency: charge.currency,
                    plan: charge.description
                });
                this.res.render('account/stripe', {
                    title: 'Subscription Success',
                    status: this.errStatus.success
                });
            });
        });

    }

    static SetRoutes(router: express.Router) {
        router.get("/purchase*", Route.BindRequest('stripeSubscriptionRoute'));
        router.post("/purchase", Route.BindRequest('purchaseRoute'));
    }

}


