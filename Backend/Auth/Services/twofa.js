const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const argon2 = require("argon2");

async function generate2FASecret(email) {
    const secret = speakeasy.generateSecret({
        name: `StockSense (${email})`,
        length: 20,
    });

    const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);

    return {
        base32: secret.base32,
        otpauth_url: secret.otpauth_url,
        qrCodeDataURL,
    };
}

function verifyTOTP(secretBase32, token) {
    return speakeasy.totp.verify({
        secret: secretBase32,
        encoding: "base32",
        token,
        window: 1,
    });
}

async function generateBackupCodes(count = 5) {
    const codes = [];
    const hashes = [];

    for (let i = 0; i < count; i++) {
        const code = Math.random().toString(36).slice(-10);
        const hash = await argon2.hash(code);
        codes.push(code);
        hashes.push(hash);
    }

    return { codes, hashes };
}

async function verifyBackupCode(code, storedHashes) {
    for (const hash of storedHashes) {
        if (await argon2.verify(hash, code)) return true;
    }
    return false;
}

module.exports = {
    generate2FASecret,
    verifyTOTP,
    generateBackupCodes,
    verifyBackupCode,
};
