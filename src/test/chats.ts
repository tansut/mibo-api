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
                        role: 'sales',
                        status: ChatStatus.assigned
                    }
                }, 'user').then((res) => {
                    chatId = res._id;
                })
            }
            );
        })

        it('should log a chat', function () {
            return lib.forceAuthenticationAll(['user', 'sales']).then(() => {
                return lib.post(`/chat/${chatId}/log`, {
                    body: {
                        from: lib.authData.user.doc._id,
                        to: lib.authData.sales.consultant._id,
                        contentType: 'text',
                        content: 'Hiii! I have serious problems!'
                    }
                }, 'user').then((res) => {

                })
            }
            );
        })

        it('should log a reply to chat', function () {
            return lib.forceAuthenticationAll(['user', 'sales']).then(() => {
                return lib.post(`/chat/${chatId}/log`, {
                    body: {
                        to: lib.authData.user.doc._id,
                        from: lib.authData.sales.consultant._id,
                        contentType: 'text',
                        content: 'Great!!'
                    }
                }, 'sales').then((res) => {

                })
            }
            );
        })

        it('should retrieve chat log', function () {
            return lib.forceAuthenticationAll(['user']).then(() => {
                return lib.get(`/chat/${chatId}/log`, {
                    json: true
                }, 'user').then((res) => {
                    debugger;
                    res.should.have.property('length').be.eql(2);
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
                //var consultantId = "587daa7961289d065c72d0bf";
                //return lib.get(`/chat/search/consultant/${consultantId}/summary`, {
                //    json: true

                return lib.get(`/chat/search/consultant/${lib.authData.sales.consultant._id}/summary`, {
                }, 'user').then((data) => {

                    //}, 'sales').then((data) => {
                    data.forEach(item => {
                        console.log(item.user.email);
                        if (item.user.email == 'saliyevska@gmail.com')
                            debugger;
                    });
                })
            }
            );
        })
    });
}