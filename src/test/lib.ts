require('should');


import { UserRoles } from '../lib/common';

import { RefreshTokenDocument } from '../db/models/refreshToken';
import { ConsultantDocument } from '../db/models/consultant';
import { UserDocument } from '../db/models/user';
import { resolveTxt } from 'dns';
import UserRoute from '../route/api/user';

import config from '../config';
import * as request from 'request';
import http = require('http');
import * as rp from 'request-promise-native';
import * as _ from 'lodash';

let route = new UserRoute();

interface IAuthData {
    user: {
        doc?: UserDocument,
        token?: undefined,
        promise?: undefined,
        resolve?: undefined,
        reject?: undefined
    },
    admin: {
        doc?: UserDocument,
        token?: undefined,
        promise?: undefined,
        resolve?: undefined,
        reject?: undefined
    },
    sales: {
        doc?: UserDocument,
        token?: undefined,
        consultant?: ConsultantDocument,
        promise?: undefined,
        resolve?: undefined,
        reject?: undefined
    },
    trainer: {
        doc?: UserDocument,
        token?: undefined,
        consultant?: ConsultantDocument,
        promise?: undefined,
        resolve?: undefined,
        reject?: undefined
    }
}

interface ITestConfig {
    development: {
        user: {
            testemail?: string,
        },
        admin: {
            testemail?: string,
        },
        sales: {
            testemail?: string,
        },
        trainer: {
            testemail?: string,
        },
        url: string
    },

    stage: {
        user: {
            testemail?: string,
        },
        admin: {
            testemail?: string,
        },
        sales: {
            testemail?: string,
        },
        trainer: {
            testemail?: string,
        },
        url: string
    },

    production: {
        user: {
            testemail?: string,
        },
        admin: {
            testemail?: string,
        },
        sales: {
            testemail?: string,
        },
        trainer: {
            testemail?: string,
        },
        url: string
    }

}

let Configurations: ITestConfig = {
    development: {
        user: {
            testemail: 'test-user@mibo.io'
        },
        admin: {
            testemail: 'test-admin@mibo.io'
        },
        sales: {
            testemail: 'test-sales@mibo.io'
        },
        trainer: {
            testemail: 'test-trainer@mibo.io'
        },
        url: (config.get('TESTURL') || 'http://localhost:') + config.port.toString() + '/api/v1'
    },

    stage: {
        user: {
            testemail: 'test-user@mibo.io'
        },
        admin: {
            testemail: 'test-admin@mibo.io'
        },
        sales: {
            testemail: 'test-sales@mibo.io'
        },
        trainer: {
            testemail: 'test-trainer@mibo.io'
        },
        url: (config.get('TESTURL') || 'http://stage-app.mibo.io') + ':' + config.port.toString() + '/api/v1'
    },

    production: {
        user: {
            testemail: 'test-user@mibo.io'
        },
        admin: {
            testemail: 'test-admin@mibo.io'
        },
        sales: {
            testemail: 'test-sales@mibo.io'
        },
        trainer: {
            testemail: 'test-trainer@mibo.io'
        },
        url: (config.get('TESTURL') || 'https://app.mibo.io') + ':' + config.port.toString() + '/api/v1'
    }
}

export let activeConfig = Configurations[config.get('NODE_ENV')];

export function deleteUsers(emails: Array<string>) {
    var promises = [];
    emails.forEach(email => {
        if (email) {
            promises.push(
                route.retrieveByEMail(email).then((user) => {
                    if (user) return route.delete(user);
                })
            )
        }
    })

    return Promise.all(promises);
}

export function removeUsers() {
    var promises = [];
    Object.keys(activeConfig).forEach((key) => {
        var email = activeConfig[key].testemail;
        if (email) {
            promises.push(
                route.retrieveByEMail(email).then((user) => {
                    if (user) return route.delete(user);
                })
            )
        }
    })

    return Promise.all(promises);
}


export function initUsers() {
    var promises = [];
    Object.keys(activeConfig).forEach((key) => {
        var email = activeConfig[key].testemail;
        if (email) {
            promises.push(
                route.retrieveByEMail(email).then((user) => {
                    if (user) return route.delete(user);
                }).then(() => {
                    return post('/user', {
                        body: {
                            email: email,
                            password: 'foo',
                            roles: [key]
                        }
                    }).then((result) => {
                        result.should.have.property('user');
                        if (result.consultants && result.consultants.length)
                            authData[key].consultant = result.consultants[0];
                        return result;
                    })
                }).then((result) => {
                    return result;
                })
            )
        }
    })

    return Promise.all(promises);
}


export let authData: IAuthData = {
    user: {

    },
    admin: {

    },
    sales: {

    },
    trainer: {

    }
};








interface IResponse {
    response: http.IncomingMessage,
    body: any
}

let addAuthToken = (role: string, options) => {
    var token = authData[role].token;
    if (!token)
        throw new Error(role + ' not authenticated');
    _.extend(options, {
        headers: {
            Authorization: token.accessToken
        }
    })
}


export let post = (url, options?: request.CoreOptions, role?: string | Array<string>) => {
    var roles = role ? (typeof role == 'string' ? [role] : role) : [];
    var promise = Promise.all(roles.map((role) => forceAuthentication(role)))

    return promise.then(() => {
        options = _.extend(options, {
            method: 'POST',
            json: true
        })
        role && addAuthToken(roles[0], options);
        return rp(activeConfig.url.concat(url), options).then((result) => {
            return result;
        });
    })
};

export let put = (url, options?: request.CoreOptions, role?: string) => {
    var promise = role ? forceAuthentication(role) : Promise.resolve();

    return promise.then(() => {
        options = _.extend(options, {
            method: 'PUT',
            json: true
        })
        role && addAuthToken(role, options);
        return rp(activeConfig.url.concat(url), options);
    })


};

export let deleteRequest = (url, options?: request.CoreOptions, role?: string) => {
    var promise = role ? forceAuthentication(role) : Promise.resolve();

    return promise.then(() => {
        options = _.extend(options, {
            method: 'DELETE',
            json: true
        })
        role && addAuthToken(role, options);

        return rp(activeConfig.url.concat(url), options);
    });
};

export let get = (url, options?: request.CoreOptions, role?: string) => {
    var promise = role ? forceAuthentication(role) : Promise.resolve();

    return promise.then(() => {
        options = _.extend(options, {
            method: 'GET'
        })
        role && addAuthToken(role, options);
        return rp(activeConfig.url.concat(url), options);
    });
};



Object.keys(authData).forEach((key) => {
    let val = authData[key];
    val.promise = new Promise<any>((resolve, reject) => {
        val.resolve = resolve;
        val.reject = reject;
    })
})




export let setAuthenticated = (role: string, result: any) => {
    authData[role].token = result.token;
    authData[role].doc = result.user;
    return authData[role].resolve(result.token);
}

export let forceAuthenticationAll = (roles: Array<string>) => {
    return Promise.all(roles.map((role) => forceAuthentication(role)));
}

export let authenticated = (role: string = 'user') => {
    return authData[role].promise;
}

export let forceAuthentication = (role: string) => {
    if (!authData[role].token)
        return post('/user/authenticate', {
            body: {
                email: activeConfig[role].testemail,
                password: 'foo'
            }
        }).then((result) => {
            return setAuthenticated(role, result)
        })
    else return authData[role].promise;
}