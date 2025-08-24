// Backend/Auth/models/OAuthAccount.js
const mongoose = require("mongoose");

const OAuthAccountSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Types.ObjectId, required: true, index: true },
        provider: { type: String, required: true, index: true }, // 'google' | 'microsoft'
        providerUserId: { type: String, required: true, index: true },
        emailVerifiedFromProvider: Boolean,
        // Optional: if you ever need to call provider APIs on user’s behalf; encrypt if used
        accessTokenEnc: String,
        refreshTokenEnc: String,
        scopes: [String],
        expiresAt: Date,
    },
    { timestamps: true }
);

OAuthAccountSchema.index({ provider: 1, providerUserId: 1 }, { unique: true });

module.exports = mongoose.model("OAuthAccount", OAuthAccountSchema);
