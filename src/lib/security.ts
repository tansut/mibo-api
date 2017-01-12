import config from '../config';
import * as crypto from 'crypto';


class Security {
    private static genericCipherAlgorithm = 'aes-256-ctr';
    private static genericTokenKey = config.enckey || '3zTvzr3p67vC61kmd54rIYu1545x4TlY';

    public static encryptGeneric(item: string): string {
        var encryptionString = item;
        var cipher = crypto.createCipher(this.genericCipherAlgorithm, this.genericTokenKey);
        var encrypted = cipher.update(encryptionString, 'utf8', 'hex');
        return encrypted;
    }

    public static decryptGeneric(encrypted: string): string {
        var cipher = crypto.createDecipher(this.genericCipherAlgorithm, this.genericTokenKey);
        var decrypted = cipher.update(encrypted, 'hex', 'utf8');
        return decrypted;
    }
}

export default Security;