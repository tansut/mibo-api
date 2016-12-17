import { resolveTxt } from 'dns';
require('should');

import config from '../config';
import * as request from 'request';
import http = require('http');
import * as rp from 'request-promise-native';
import * as _ from 'lodash';


let authToken = undefined;

let urls = {
}

urls['development'] = 'http://localhost:' + config.port.toString() + '/api/v1';
urls['production'] = 'http://app.mibo.io/api/v1';
urls['stage'] = 'http://stage-app.mibo.io/api/v1';


export let appconfig = {
    baseUrl: urls[config.get('NODE_ENV')]
}

interface IResponse {
    response: http.IncomingMessage,
    body: any
}

let addAuthToken = (options) => {
    if (authToken)
        _.extend(options, {
            headers: {
                Authorization: authToken.accessToken
            }
        })
}


export let post = (url, options?: request.CoreOptions) => {
    options = _.extend(options, {
        method: 'POST',
        json: true
    })
    addAuthToken(options);
    return rp(appconfig.baseUrl.concat(url), options).then((result) => {
        return result;
    });
};

export let put = (url, options?: request.CoreOptions) => {
    options = _.extend(options, {
        method: 'PUT',
        json: true
    })
    addAuthToken(options);
    return rp(appconfig.baseUrl.concat(url), options);
};

export let deleteRequest = (url, options?: request.CoreOptions) => {
    options = _.extend(options, {
        method: 'DELETE',
        json: true
    })
    addAuthToken(options);

    return rp(appconfig.baseUrl.concat(url), options);
};

export let get = (url, options?: request.CoreOptions) => {
    options = _.extend(options, {
        method: 'GET'
    })
    addAuthToken(options);
    return rp(appconfig.baseUrl.concat(url), options);
};


let resolveToken, rejectToken;

let authDonePromise = new Promise<any>((resolve, reject) => {
    resolveToken = resolve;
    rejectToken = reject;
})

export let authenticationDone = (token?) => {
    if (token) {
        authToken = token;
        return resolveToken(authToken);
    } else {
        return authDonePromise;
    }
}