import * as stream from 'stream';
import { IntegrationInfo } from './common';
import * as common from './common';
import * as StripeLib from 'stripe';
import config from '../config';

let lib = StripeLib(config.stripeApi);

export const StripeKey: string = 'stripe';

interface IStripeData {

}

interface ISubscription {
    plan: string;
    id: string;
}

export class UserData extends IntegrationInfo<IStripeData> {
    public subscription: ISubscription;
    public token: string;
    constructor(remoteId: string) {
        super(remoteId);
    }
}


class StripeManager {

    createUser(id: string, email: string, source?: string) {
        return lib.customers.create({
            email: email,
            description: id,
            source: source
        })
    }

    subscripe(stripeId: string, plan: string) {
        return lib.subscriptions.create({
            customer: stripeId,
            plan: plan
        });
    }

    updateSubscription(subsId: string, plan: string) {
        return lib.subscriptions.update(subsId, {
            plan: plan
        });
    }
}

export default new StripeManager();

// below code from Cansu :) again :)
// ,; ü
// iplğggf,.
// ,p,.-|π``|`.Ğ-pıkbt6-ğü,
// iüop-ğüiıkşü
// ,i0ş
