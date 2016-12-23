import { IRequestParams } from './base';
import { ObjectID } from 'mongodb';
import { request } from 'https';
import * as express from "express";
import * as http from '../../lib/http';
import * as common from '../../lib/common';
import * as validator from 'validator';
import ApiBase from './base';
import { User, UserDocument, UserModel } from '../../db/models/user';
import stripe from '../../lib/stripe';
import { UserData as StripeData } from '../../lib/stripe';
import UserRoute from './user';

export default class PaymentRoute extends ApiBase {
    private userRoute: UserRoute;

    createSubscription(user: UserDocument, plan: string, source: string, role: string) {
        if (user.integrations.stripe && user.integrations.stripe.remoteId)
            return this.changeSubscription(user, plan, role);
        return stripe.createUser(user._id.toString(), user.email, source).then((striperes) => {
            user.integrations.stripe = new StripeData(striperes.id);
            user.integrations.stripe.source = source;
            return user.save().then(() => this.changeSubscription(user, plan, role));
        })
    }

    changeSubscription(user: UserDocument, plan: string, role: string, source?: string) {
        if (user.integrations.stripe && user.integrations.stripe.subscriptions[role]) {
            return stripe.updateSubscription(user.integrations.stripe.subscriptions[role].id, plan, source).then((sres) => {
                user.integrations.stripe.subscriptions[role] = {
                    plan: plan,
                    id: sres.id
                };
                if (source)
                    user.integrations.stripe.source = source;
                user.markModified('integrations.stripe');
                return user.save();
            })
        } else {
            return stripe.subscripe(user.integrations.stripe.remoteId, plan).then((sres) => {
                user.integrations.stripe.subscriptions[role] = {
                    plan: plan,
                    id: sres.id
                };
                if (source)
                    user.integrations.stripe.source = source;
                user.markModified('integrations.stripe');
                return user.save();
            });
        }
    }

    createSubscriptionRoute() {
        return this.userRoute.retrieve(this.req.params.userid).then((user) => {
            return this.createSubscription(user, this.req.body.plan, this.req.body.source, this.req.params.role).then(() => this.res.sendStatus(200));
        });
    }

    getSubscriptionsRoute() {
        return this.userRoute.retrieve(this.req.params.userid).then((user) => {
            let result = user.integrations.stripe && user.integrations.stripe.subscriptions ?
                user.integrations.stripe.subscriptions : [];
            this.res.send(result);
        });
    }

    //Below code from Cansu :)
    // -üü -,,,Ü

    //     , i, ğİİ -,ü, ğüğ, -ü - ğ, ü,
    //     üüğ - i c    

    changeSubscriptionRoute() {
        return this.userRoute.retrieve(this.req.params.userid).then((user) => {
            if (user.integrations.stripe && user.integrations.stripe.remoteId)
                return this.changeSubscription(user, this.req.body.plan, this.req.params.role).then(() => this.res.sendStatus(200));
            else return Promise.reject(new http.ValidationError('no plan for user'));
        });
    }

    constructor(reqParams: IRequestParams) {
        super(reqParams);
        this.userRoute = new UserRoute(reqParams);
    }


    static SetRoutes(router: express.Router) {
        router.post("/subscription/change/:userid/:role", PaymentRoute.BindRequest('changeSubscriptionRoute'));
        router.get("/subscription/get/:userid", PaymentRoute.BindRequest('getSubscriptionsRoute'));
        router.post("/subscription/create/:userid/:role", PaymentRoute.BindRequest('createSubscriptionRoute'));
    }
}
