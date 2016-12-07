import * as stream from 'stream';
import { IntegrationInfo } from './common';
import * as common from './common';
import * as StripeLib from 'stripe';

export const StripeKey: string = 'stripe';

interface IStripeData {

}

export class UserData extends IntegrationInfo<IStripeData> {

}

interface StripeConfig {
    apikey: string;
}

class StripeManager {
    lib: any;

    constructor(private config: StripeConfig) {
        this.lib = StripeLib(config.apikey);
    }
}

export let Stripe: StripeManager;

export default (config: StripeConfig) => Stripe || (Stripe = new StripeManager(config));