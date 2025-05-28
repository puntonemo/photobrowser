import crypto from 'crypto';
const CRYPTO_ALGORITHM = 'aes-256-ctr';
const IV_LENGTH = 16;

export function encrypt(text: string, password?: string) {
    try {
        let iv = crypto.randomBytes(IV_LENGTH);
        let cipher = crypto.createCipheriv(
            CRYPTO_ALGORITHM,
            Buffer.concat([Buffer.from(password || process.env.ENCRYPTION_KEY || ''), Buffer.alloc(32)], 32),
            iv,
        );
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (ex) {
        console.log('encrypt failed: %o : %o', text, ex);
        return undefined;
    }
}

export function decrypt(text: string, password?: string) {
    try {
        let textParts = text.split(':');
        let textPartsShift = textParts.shift();
        if (textPartsShift) {
            let iv = Buffer.from(textPartsShift, 'hex');
            let encryptedText = Buffer.from(textParts.join(':'), 'hex');
            let decipher = crypto.createDecipheriv(
                CRYPTO_ALGORITHM,
                Buffer.concat([Buffer.from(password || process.env.ENCRYPTION_KEY || ''), Buffer.alloc(32)], 32),
                iv,
            );
            let decrypted = decipher.update(encryptedText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return decrypted.toString();
        } else {
            return undefined;
        }
    } catch {
        return undefined;
    }
}
