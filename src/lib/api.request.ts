import * as express from 'express';

export interface ApiRequest extends express.Request {
    user: any;
}