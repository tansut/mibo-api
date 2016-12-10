let reflect = require('reflect-metadata');

export class IntegrationInfo<T> {
    public data?: T;

    constructor(public remoteId: string) {

    }
}

export const Plans = {
    basicMonthly: 'basic-monthly'
}

export class Auth {
    static Anonymous() {
        var fn = () => {
            return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
                reflect.defineMetadata('auth:anonymous', null, target);
            }
        }
        return fn();
    }
}