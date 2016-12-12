import 'reflect-metadata';

export const UserRoles = {
    admin: 'admin',
    dietition: 'dietition',
    user: 'user',
    sales: 'sales'
}

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
                Reflect.defineMetadata('auth:anonymous', {}, descriptor.value);
            }
        }
        return fn();
    }

    static GetAnonymous(target: any) {
        return Reflect.getMetadata('auth:anonymous', target);
    }
}