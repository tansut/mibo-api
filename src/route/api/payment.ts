import { IRequestParams } from '../baserouter';
import { ObjectID } from 'mongodb';
import { request } from 'https';
import * as express from "express";
import * as http from '../../lib/http';
import * as common from '../../lib/common';
import * as validator from 'validator';
import * as _ from 'lodash';
import ApiBase from './base';
import { User, UserDocument, UserModel } from '../../db/models/user';
import stripe from '../../lib/stripe';
import { UserData as StripeData } from '../../lib/stripe';
import UserRoute from './user';
import emailmanager from '../../lib/email';


export default class PaymentRoute extends ApiBase {
    private userRoute: UserRoute;

    createSubscription(user: UserDocument, plan: string, source: string, role: string, coupon?: string) {
        if (user.integrations.stripe && user.integrations.stripe.remoteId)
            return this.changeSubscription(user, plan, role, undefined, coupon);
        return stripe.createUser(user._id.toString(), user.email, source).then((striperes) => {
            user.integrations.stripe = new StripeData(striperes.id);
            user.integrations.stripe.source = source;
            return user.save().then(() => this.changeSubscription(user, plan, role, undefined, coupon));
        })
    }

    changeSubscription(user: UserDocument, plan: string, role: string, source?: string, coupon?: string) {
        if (user.integrations.stripe && user.integrations.stripe.subscriptions[role]) {
            return stripe.updateSubscription(user.integrations.stripe.subscriptions[role].id, plan, source, coupon).then((sres) => {
                user.integrations.stripe.subscriptions[role] = {
                    plan: plan,
                    id: sres.id,
                    coupon: coupon
                };
                if (source)
                    user.integrations.stripe.source = source;
                user.markModified('integrations.stripe');
                return user.save().then(() => sres);
            })
        } else {
            return stripe.subscripe(user.integrations.stripe.remoteId, plan, coupon).then((sres) => {
                user.integrations.stripe.subscriptions[role] = {
                    plan: plan,
                    id: sres.id,
                    coupon: coupon
                };
                if (source)
                    user.integrations.stripe.source = source;
                user.markModified('integrations.stripe');
                return user.save().then((userRes) => {
                    return emailmanager.send(userRes.email, 'MiBo - Thank You for Your Order', 'purchasereply.ejs', {
                        title: 'Congrats!',
                        customer: userRes.nickName,
                    }).then(() => sres);
                })
            });
        }
    }

    createSubscriptionRoute() {
        return this.userRoute.retrieve(this.req.params.userid).then((user) => {
            return this.createSubscription(user, this.req.body.plan, this.req.body.source, this.req.params.role, this.req.body.coupon).then((res) => this.res.send(res));
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
                return this.changeSubscription(user, this.req.body.plan, this.req.params.role, undefined, this.req.body.coupon).then((res) => this.res.send(res));
            else return Promise.reject(new http.ValidationError('no plan for user'));
        });
    }

    getCoupon(coupon: string) {
        return stripe.getCoupon(coupon);
    }

    getCouponRoute() {
        this.getCoupon(this.req.params.coupon).then((coupon) => coupon.valid ? this.res.send(coupon) : this.next(new http.ValidationError("Not Valid"))).catch((err) => this.next(new http.NotFoundError(err.message)));
    }

    getPlansRoute() {
        var currency = this.req.query.currency;
        return stripe.getPlans().then((plans) => {
            debugger;
            if (currency) {
                var filtered = _.filter(plans.data, (plan) => plan.currency == (<string>currency).toLowerCase());
                this.res.send(filtered);
            }
            else this.res.send(plans.data)
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
        router.get("/coupon/:coupon", PaymentRoute.BindRequest('getCouponRoute'));
        router.get("/plans", PaymentRoute.BindRequest('getPlansRoute'));
    }
}
