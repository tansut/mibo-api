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
    createPlan(user: UserDocument, plan: string, source: string) {
        if (user.integrations.stripe && user.integrations.stripe.remoteId)
            return this.changePlan(user, plan);
        return stripe.createUser(user._id.toString(), user.email, source).then((striperes) => {
            user.integrations.stripe = new StripeData(striperes.id);
            user.integrations.stripe.source = source;
            return user.save().then(() => this.changePlan(user, plan));
        })
    }

    changePlan(user: UserDocument, plan: string) {
        if (user.integrations.stripe && user.integrations.stripe.subscription) {
            return stripe.updateSubscription(user.integrations.stripe.subscription.id, plan).then((sres) => {
                user.integrations.stripe.subscription = {
                    plan: plan,
                    id: sres.id
                };
                user.markModified('integrations.stripe');
                return user.save();
            })
        } else {
            return stripe.subscripe(user.integrations.stripe.remoteId, plan).then((sres) => {
                user.integrations.stripe.subscription = {
                    plan: plan,
                    id: sres.id
                };
                user.markModified('integrations.stripe');
                return user.save();
            });
        }
    }

    createPlanRoute() {
        return this.userRoute.retrieve(this.req.params.userid).then((user) => {
            return this.createPlan(user, this.req.body.plan, this.req.body.source).then(() => this.res.sendStatus(200));
        });
    }

    getPlanRoute() {
        return this.userRoute.retrieve(this.req.params.userid).then((user) => {
            let plan = user.integrations.stripe && user.integrations.stripe.subscription ?
                user.integrations.stripe.subscription.plan : undefined;
            this.res.send({
                plan: plan
            });
        });
    }

    //Below code from Cansu :)
    // -üü -,,,Ü

    //     , i, ğİİ -,ü, ğüğ, -ü - ğ, ü,
    //     üüğ - i c    

    changePlanRoute() {
        return this.userRoute.retrieve(this.req.params.userid).then((user) => {
            if (user.integrations.stripe && user.integrations.stripe.remoteId)
                return this.changePlan(user, this.req.body.plan).then(() => this.res.sendStatus(200));
            else return Promise.reject(new http.ValidationError('no plan for user'));

        });
    }

    constructor(reqParams: IRequestParams) {
        super(reqParams);
        this.userRoute = new UserRoute(reqParams);
    }


    static SetRoutes(router: express.Router) {
        router.get("/status", PaymentRoute.BindRequest('statusRoute'));
        router.post("/plan/change/:userid", PaymentRoute.BindRequest('changePlanRoute'));
        router.get("/plan/get/:userid", PaymentRoute.BindRequest('getPlanRoute'));
        router.post("/plan/create/:userid", PaymentRoute.BindRequest('createPlanRoute'));
    }
}
