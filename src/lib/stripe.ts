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
    public subscriptions: { [role: string]: ISubscription } = {};
    public source: string;
    constructor(remoteId: string) {
        super(remoteId);
    }
}


class StripeManager {

    deleteCustomer(customerId: string) {
        return lib.customers.del(customerId);
    }

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

    createTokenSample() {
        var card = {
            number: '4242424242424242',
            exp_month: 12,
            exp_year: 2017,
            cvc: '123'
        }
        return lib.tokens.create(<any>{
            card: card
        });
    }

    updateSubscription(subsId: string, plan: string, source?: string) {
        var data = {
            plan: plan
        };
        if (source)
            data['source'] = source;
        return lib.subscriptions.update(subsId, data);
    }
}

export default new StripeManager();

// below code from Cansu :) again :)
// ,; ü
// iplğggf,.
// ,p,.-|π``|`.Ğ-pıkbt6-ğü,
// iüop-ğüiıkşü
// ,i0ş
