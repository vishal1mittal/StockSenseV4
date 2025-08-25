// Backend/Auth/models/User.js
const mongoose = require("mongoose");

const TwoFASchema = new mongoose.Schema(
    {
        enabled: { type: Boolean, default: false },
        secretEnc: { type: String }, // store encrypted base32 secret later
        backupCodesHash: [{ type: String }], // hashed one-time codes
    },
    { _id: false }
);

const UserSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            index: true,
            lowercase: true,
            trim: true,
        },
        emailVerified: { type: Boolean, default: false },
        emailVerificationToken: { type: String },
        emailVerificationExpires: { type: Date },

        // Local auth
        passwordHash: { type: String }, // null for OAuth-only users

        // Security / access
        roles: { type: [String], default: ["user"], index: true }, // e.g., ['user','admin']
        auth_ver: { type: Number, default: 1 }, // bump to invalidate all access JWTs

        // 2FA (optional, for later)
        twoFA: { type: TwoFASchema, default: () => ({}) },
        oauthProvider: { type: String },
        oauthId: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
