export class IntegrationInfo<T> {
    public data?: T;

    constructor(public remoteId: string) {

    }
}

export const Plans = {
    basicMonthly: 'basic-monthly'
}