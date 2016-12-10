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
import { route as userRoute } from './user';

class Route extends ApiBase {



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

    createPlanRoute(req: http.ApiRequest, res: express.Response, next: Function) {
        userRoute.retrieve(req.params.userid).then((user) => {
            if (!validator.contains(req.body.plan, Object.keys(common.Plans).map((k) => common.Plans[k])))
                return Promise.reject(new http.ValidationError());
            return this.createPlan(user, req.body.plan, req.body.source).then(() => res.sendStatus(200));
        }).catch((err) => next(err));
    }

    getPlanRoute(req: http.ApiRequest, res: express.Response, next: Function) {
        userRoute.retrieve(req.params.userid).then((user) => {
            let plan = user.integrations.stripe && user.integrations.stripe.subscription ?
                user.integrations.stripe.subscription.plan : undefined;
            res.send({
                plan: plan
            });
        }).catch((err) => next(err));


    }

    //Below code from Cansu :)
    // -üü -,,,Ü

    //     , i, ğİİ -,ü, ğüğ, -ü - ğ, ü,
    //     üüğ - i c    

    changePlanRoute(req: http.ApiRequest, res: express.Response, next: Function) {

    }

    constructor(router?: express.Router) {
        super(router);
        this.router && router.post("/plan/change/:userid", this.forceAuthenticate.bind(this), this.changePlanRoute.bind(this));
        this.router && router.get("/plan/get/:userid", this.forceAuthenticate.bind(this), this.getPlanRoute.bind(this));
        this.router && router.post("/plan/create/:userid", this.forceAuthenticate.bind(this), this.createPlanRoute.bind(this));
    }
}

export let route: Route;
export function init(router?: express.Router) { route = new Route(router) };