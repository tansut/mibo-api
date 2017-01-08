import { ChatStatus } from '../db/models/chat';
import { json } from 'body-parser';
import { debug } from 'util';
import * as mocha from 'mocha';
import * as lib from './lib';


export default function () {
    let chatId: string;
    describe('chat', function () {
        it('should create a chat session for user', function () {
            return lib.forceAuthenticationAll(['user', 'sales']).then(() => {
                return lib.post('/chat', {
                    body: {
                        user: lib.authData.user.doc._id,
                        consultant: lib.authData.sales.consultant._id,
                        role: 'sales'
                    }
                }, 'user').then((res) => {
                    chatId = res._id;
                })
            }
            );
        })
        it('should end session', function () {
            return lib.forceAuthenticationAll(['user', 'sales']).then(() => {
                return lib.post(`/chat/${chatId}/end`, {


                }, 'user')
            }
            );
        })

        it('should search chats by consultant', function () {
            return lib.forceAuthenticationAll(['user', 'sales']).then(() => {
                return lib.get(`/chat/search/consultant/${lib.authData.sales.consultant._id}`, {
                }, 'user').then((result) => {
                })
            }
            );
        })

        it('should initialize chat session by sales for user & consultant', function () {
            return lib.forceAuthenticationAll(['sales', 'trainer', 'user']).then(() => {
                return lib.post('/chat', {
                    body: {
                        user: lib.authData.user.doc._id,
                        consultant: lib.authData.trainer.consultant._id,
                        role: 'trainer',
                        status: ChatStatus.assigned
                    }
                }, 'sales').then((res) => {
                    chatId = res._id;
                })
            }
            );
        })

        it('should search chats by user', function () {
            return lib.forceAuthenticationAll(['user', 'sales']).then(() => {
                return lib.get(`/chat/search/user/${lib.authData.user.doc._id}`, {
                }, 'user')
            }
            );
        })
        it('should summarize chats for user', function () {
            return lib.forceAuthenticationAll(['user', 'sales']).then(() => {
                return lib.get(`/chat/search/user/${lib.authData.user.doc._id}/summary`, {
                }, 'user')
            }
            );
        })
        it('should summarize chats by consultant', function () {
            return lib.forceAuthenticationAll(['user', 'sales']).then(() => {
                // var consultantId = "58579e2361dd5d045cc23f3e";
                // return lib.get(`/chat/search/consultant/${consultantId}/summary`, {

                return lib.get(`/chat/search/consultant/${lib.authData.sales.consultant._id}/summary`, {
                }, 'user').then((result) => {
                    debugger;
                })
            }
            );
        })
    });
}