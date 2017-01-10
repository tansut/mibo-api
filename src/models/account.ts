import * as stream from 'stream';
export interface SignupModel {
    nickName?: string;
    roles?: Array<string>;
    email: string;
    password: string;
    country?: string;
    language?: string;
}

export interface ConsultantCreateModel {
    user: string,
    active: boolean,
    firstName: string,
    lastName: string,
    role: string
}

export interface ChatCreateModel {
    user: string;
    consultant: string;
    role: string;
    status: string;
    type: string;
}