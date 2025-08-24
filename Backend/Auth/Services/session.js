const { v4: uuidv4 } = require("uuid");
const { Session } = require("../Models");
const { generateRefreshToken } = require("./tokens");
const argon2 = require("argon2");

async function createSession(userId, ip, ua) {
    const sessionId = uuidv4();
    const opaqueToken = uuidv4();
    const refreshHash = await argon2.hash(opaqueToken);

    const session = await Session.create({
        userId,
        sessionId,
        refreshHash,
        ip,
        ua,
        expiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    });

    const jwtRefresh = generateRefreshToken(sessionId);

    return { session, refreshToken: jwtRefresh, opaqueToken };
}

async function verifySession(sessionId, opaqueToken) {
    const session = await Session.findOne({ sessionId, revokedAt: null });

    if (!session) return null;

    const ok = await argon2.verify(session.refreshHash, opaqueToken);

    if (!ok) return null;

    return session;
}

async function revokeSession(sessionId, reason = "manual") {
    return Session.findOneAndUpdate(
        { sessionId },
        { revokedAt: new Date(), reason },
        { new: true }
    );
}

module.exports = {
    createSession,
    verifySession,
    revokeSession,
};
