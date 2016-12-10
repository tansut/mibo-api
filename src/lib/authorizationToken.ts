import * as _ from 'lodash';
import * as moment from 'moment';
import * as crypto from 'crypto';
import { RefreshTokenModel, RefreshTokenDocument } from '../db/models/refreshToken';
import { UserModel } from '../db/models/user';


interface encrypytionData {
    tag: Buffer,
    encryptedData: string
}

export interface IEncryptedAccessTokenData {
    tag: string;
    tokenData: string;
}

export interface IAccessTokenData {
    userId: string;
    expiration_time: Date;
    props: any[];
}

export interface IRefreshTokenData {
    access_token: IEncryptedAccessTokenData;
    userId: string;
    tokenId: string;
    expire_time: Date;
}


export interface IEncryptedRefreshTokenData {
    tag: string;
    refresh_token: string;
}

class AuthorizationTokenController {
    private genericCipherAlgorithm = 'aes-256-ctr';
    private cipherAlgorithm = 'aes-256-gcm';
    private genericTokenKey = '3zTvzr3p67VC61jmV54rIYu1545x4TlY';
    private genericTokenIV = '60ih0h6vcoEa';

    private convertUtfStringToBuffer(input: string): Buffer {
        return Buffer.from(input, 'utf8');
    }

    private convertBufferToUtfString(input: Buffer): string {
        return input.toString('utf8');
    }

    private encryptGeneric(item : Object) : string {
        var encryptionString = JSON.stringify(item);
        var cipher = crypto.createCipher(this.genericCipherAlgorithm, this.genericTokenKey);
        var encrypted = cipher.update(encryptionString, 'utf8', 'hex');
        return encrypted;
    }

    private decryptGeneric(encrypted : string) : Object{
         var cipher = crypto.createDecipher(this.genericCipherAlgorithm, this.genericTokenKey);
        var decrypted = cipher.update(encrypted,'hex','utf8');
        return JSON.parse(decrypted);
    }

    private encrypt(item: Object, iv: string): encrypytionData {
        var encryptionString = JSON.stringify(item);
        var cipher = crypto.createCipheriv(this.cipherAlgorithm, this.genericTokenKey, iv);
        var encrypted = cipher.update(encryptionString, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        var tag = cipher.getAuthTag();
        return { tag: tag, encryptedData: encrypted };
    }

    private decrypt(encryptedData: string, tag: Buffer, iv: string): any {
        var deChipher = crypto.createDecipheriv(this.cipherAlgorithm, this.genericTokenKey, iv);
        deChipher.setAuthTag(tag);
        var decryptedToken = deChipher.update(encryptedData, 'hex', 'utf8');
        decryptedToken += deChipher.final('utf8');
        return JSON.parse(decryptedToken);
    }

    encryptAccessToken(tokenData: IAccessTokenData): string {
        var encryption = this.encryptGeneric(tokenData);
        return encryption;
    }

    encryptRefreshToken(userId: string, access_token: IAccessTokenData) : Promise<string> {
        return new Promise((resolve, reject) => {
            UserModel.findById(userId).exec((err, res) => {
                if (err) {
                    reject(new Error("User not found"));
                    return;
                }
                var encryptAccessToken = this.encrypt(access_token, res.ivCode);
                var tagDataString = this.convertBufferToUtfString(encryptAccessToken.tag);
                var encryptedAccessToken = <IEncryptedAccessTokenData>{ tokenData: encryptAccessToken.encryptedData, tag: tagDataString };
                var refreshToken = <IRefreshTokenData>{
                    access_token: encryptedAccessToken,
                    expire_time: moment().add('year', 1).toDate(),
                    userId: userId
                }

                var refreshTokenDocument = <RefreshTokenDocument>{
                    userId: userId,
                    token: encryptedAccessToken.tokenData,
                    tag: encryptAccessToken.tag
                };

                RefreshTokenModel.create(refreshTokenDocument).then((createdDocument: RefreshTokenDocument) => {
                    refreshToken.tokenId = createdDocument._id;

                    var encryptedRefreshToken = this.encryptGeneric(refreshToken); 

                    resolve(encryptedRefreshToken);
                }).catch((err) => {
                    reject(new Error("Refresh token couldn't be created"));
                    return;
                });

            });

        });
    }

    decryptAccessToken(accessTokenData: string): IAccessTokenData {
        var decryptedData = <IAccessTokenData>this.decryptGeneric(accessTokenData);
        return decryptedData;
    }

    decryptRefreshToken(refreshTokenData: string, tag: string) {
        return new Promise((resolve, reject) => {
            var tagBuffer = this.convertUtfStringToBuffer(tag);
            var refreshTokenUnDecrypted = <IRefreshTokenData>this.decrypt(<any>(refreshTokenData), tagBuffer, this.genericTokenIV);
            UserModel.findById(refreshTokenUnDecrypted.userId).exec((userErr, user) => {
                if (userErr) {
                    reject(userErr);
                    return;
                }

                tagBuffer = this.convertUtfStringToBuffer(refreshTokenUnDecrypted.access_token.tag);
                var tokenData = <IAccessTokenData>this.decrypt(refreshTokenUnDecrypted.access_token.tokenData, tagBuffer, user.ivCode);

                resolve(tokenData);
            });
        });
    }
}


/*
Usage of tokens : 
    access_token 
    Incoming Token Data (JSON) : {
        tag : self decryption tag,
        tokenData (generic encrypted) : {
            Includes User Id,
            Expiration Time Of Token Itself, (30 minutes default),
            other props : any[]
        }
    }

    refresh_token 
    If Incoming Token Data Fails : {
        Client sends refresh token,
        Refresh token includes : {
            tokenId : Self decryption tag,
            refresh_token : (generic encrypted) {
                access_token : (private encrypted)
                Refresh token Id (private encrypted),
                Expiration time of refresh token Itself, (1 year default)
            }
        }
        Refresh token regenerated. Old one expires
        New access token generated for refresh token (expire time changes)
        Sends client side new access_token along with refresh token
    }

 */

export default new AuthorizationTokenController();