require('should');

import config from '../config';
import * as request from 'request';
import http = require('http');
import * as rp from 'request-promise-native';
import * as _ from 'lodash';

export let appconfig = {
    baseUrl: 'http://localhost:' + config.port.toString() + '/api/v1'
}

interface IResponse {
    response: http.IncomingMessage,
    body: any
}

export let post = (url, options?: request.CoreOptions) => {
    options = _.extend(options, {
        method: 'POST',
        json: true
    })
    return rp(appconfig.baseUrl.concat(url), options).then((result) => {
        return result;
    });
};

export let put = (url, options?: request.CoreOptions) => {
    options = _.extend(options, {
        method: 'PUT',
        json: true
    })
    return rp(appconfig.baseUrl.concat(url), options);
};

export let deleteRequest = (url, options?: request.CoreOptions) => {
    options = _.extend(options, {
        method: 'DELETE',
        json: true
    })
    return rp(appconfig.baseUrl.concat(url), options);
};

export let get = (url, options?: request.CoreOptions) => {
    options = _.extend(options, {
        method: 'GET'
    })
    return rp(appconfig.baseUrl.concat(url), options);
};