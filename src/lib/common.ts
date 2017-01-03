import 'reflect-metadata';

export const UserRoles = {
    admin: 'admin',
    dietitian: 'dietitian',
    user: 'user',
    sales: 'sales',
    therapist: 'therapist',
    trainer: 'trainer'
}

export class IntegrationInfo<T> {
    public data?: T;

    toClient(): any {
        return {};
    }

    constructor(public remoteId: string) {

    }
}

export const Plans = {
    messageonly6mlyT: 'messageonly6mlyT',
    message1vidperm6mlyT: 'message1vidperm6mlyT'
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