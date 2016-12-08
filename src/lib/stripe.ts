import * as stream from 'stream';
import { IntegrationInfo } from './common';
import * as common from './common';
import * as StripeLib from 'stripe';
import config from '../config';

let lib = StripeLib(config.stripeApi);

export const StripeKey: string = 'stripe';

interface IStripeData {

}

export class UserData extends IntegrationInfo<IStripeData> {

}


class StripeManager {
    createUser(id: string, email: string) {
        lib.customers.create({
            email: email,
            description: id
        })
    }
}

export let Stripe: StripeManager;

export default {
    init: () => Stripe || (Stripe = new StripeManager())
}