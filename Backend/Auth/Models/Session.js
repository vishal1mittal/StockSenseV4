// Backend/Auth/models/Session.js
const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Types.ObjectId, required: true, index: true },
        sessionId: { type: String, required: true, unique: true, index: true }, // uuid
        refreshHash: { type: String, required: true }, // argon2 hash of opaque refresh token
        ua: String,
        ip: String,
        revokedAt: Date,
        reason: String,
        // TTL so Mongo auto-cleans stale sessions (covers 7d refresh window + grace)
        expiresAt: { type: Date, required: true, index: { expires: 0 } },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Session", SessionSchema);
