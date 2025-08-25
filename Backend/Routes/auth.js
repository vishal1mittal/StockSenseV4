const express = require("express");
const router = express.Router();

const User = require("../Auth/Models/User");
const Auth = require("../Auth/Services");
const authenticateToken = require("../Auth/Middleware/authenticate");
const authorizeRoles = require("../Auth/Middleware/authorize");
const passport = require("../Auth/Strategies/google");
const { hash } = require("argon2");

const { generateAccessToken } = Auth.tokens;
const { createSession, verifySession, revokeSession } = Auth.session;
const { hashPassword, verifyPassword } = Auth.password;

router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res
                .status(400)
                .json({ error: "Email and password required" });

        const exists = await User.findOne({ email });

        if (exists)
            return res.status(400).json({ error: "Email already exists" });

        const passwordHash = await hashPassword(password);

        const user = await User.create({
            email,
            passwordHash,
        });

        res.status(201).json({ message: "User registered", uid: user._id });
    } catch (error) {
        console.error("Register error: ", error);
        res.status(201).json({ error: "Server error" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password, token, backupCode } = req.body;
        const user = await User.findOne({ email });

        if (!user)
            return res.status(401).json({ error: "Invalid credentials" });

        const ok = await verifyPassword(user.passwordHash, password);

        if (!ok) return res.status(401).json({ error: "Invalid credentials" });

        if (user.twoFA.enabled) {
            let valid = false;

            if (token) {
                valid = Auth.twofa.verifyTOTP(user.twoFA.secretEnc, token);
            } else if (backupCode) {
                let matchedIndex = -1;

                for (let i = 0; i < user.twoFA.backupCodesHash.length; i++) {
                    const ok = await Auth.twofa.verifyBackupCode(backupCode, [
                        user.twoFA.backupCodesHash[i],
                    ]);

                    if (ok) {
                        matchedIndex = i;
                        valid = true;
                        break;
                    }
                }

                if (valid && matchedIndex !== -1) {
                    user.twoFA.backupCodesHash.splice(matchedIndex, 1);
                    await user.save();
                }
            }

            if (!valid) {
                return res
                    .status(401)
                    .json({ error: "2FA required or invalid" });
            }
        }

        const accessToken = generateAccessToken(user);
        const { refreshToken, opaqueToken, session } = await createSession(
            user._id,
            req.ip,
            req.headers["user-agent"] || "unknown"
        );

        res.json({
            accessToken,
            refreshToken,
            opaqueToken,
            sessionId: session.sessionId,
        });
    } catch (error) {
        console.error("Login Error: ", error);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/refresh", async (req, res) => {
    try {
        const { refreshToken, opaqueToken } = req.body;

        if (!refreshToken || !opaqueToken)
            return res.status(400).json({ error: "Tokens required" });

        const decoded = Auth.tokens.verifyToken(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        if (!decoded)
            return res.status(401).json({ error: "Invalid refresh token" });

        const session = await verifySession(decoded.sid, opaqueToken);
        if (!session) return res.status(401).json({ error: "Session invalid" });

        const user = await User.findById(session.userId);
        if (!user) return res.status(401).json({ error: "User not found" });

        const newAccessToken = generateAccessToken(user);
        res.json({ accessToken: newAccessToken });
    } catch (error) {
        console.error("Refresh error: ", error);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/logout", async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId)
            return res.status(400).json({ error: "SessionId required" });

        await revokeSession(sessionId, "logout");
        res.json({ message: "Logged out" });
    } catch (error) {
        console.error("Logout error: ", error);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/enable2fa", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ error: "User not found" });

        const { base32, qrCodeDataURL } = await Auth.twofa.generate2FASecret(
            user.email
        );

        user.twoFA.secretEnc = base32;
        await user.save();

        res.json({
            message:
                "2FA secret generated. Scan QR code in your authenticator app.",
            qrCodeDataURL,
        });
    } catch (error) {
        console.error("Enable 2FA error: ", error);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/confirm2fa", authenticateToken, async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findById(req.user.id);

        if (!user || !user.twoFA.secretEnc)
            return res.status(400).json({ error: "2FA not initialized" });

        const valid = Auth.twofa.verifyTOTP(user.twoFA.secretEnc, token);

        if (!valid) return res.status(400).json({ error: "Invalid Token" });

        user.twoFA.enabled = true;

        const { codes, hashes } = await Auth.twofa.generateBackupCodes();
        user.twoFA.backupCodesHash = hashes;

        await user.save();

        res.json({ message: "2FA enabled", backupCodes: codes });
    } catch (error) {
        console.error("Confirm 2FA error: ", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/refresh2fabackup", authenticateToken, async (req, res) => {
    try {
        const { password, token, backupCode } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (!user.twoFA.enabled) {
            return res.status(400).json({ error: "2FA not enabled" });
        }

        const ok = await verifyPassword(user.passwordHash, password);
        if (!ok) return res.status(401).json({ error: "Invalid Password" });

        let valid = false;

        if (token) {
            valid = Auth.twofa.verifyTOTP(user.twoFA.secretEnc, token);
        } else if (backupCode) {
            for (let i = 0; i < user.twoFA.backupCodesHash.length; i++) {
                const isMatch = await Auth.twofa.verifyBackupCode(backupCode, [
                    user.twoFA.backupCodesHash[i],
                ]);

                if (isMatch) {
                    valid = true;
                    break;
                }
            }
        }

        if (!valid) {
            return res.status(401).json({ error: "Invalid 2FA proof" });
        }

        const { codes, hashes } = await Auth.twofa.generateBackupCodes();

        user.twoFA.backupCodesHash = hashes;
        await user.save();

        res.json({
            message: "Backup codes regenerated",
            backupCodes: codes,
        });
    } catch (error) {
        console.error("Regenerate backup codes error: ", error);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/disable2fa", authenticateToken, async (req, res) => {
    try {
        const { password, token, backupCode } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ error: "User not found" });

        const ok = await verifyPassword(user.passwordHash, password);
        if (!ok) return res.status(401).json({ error: "Invalid Password" });

        let valid = false;

        if (token) valid = Auth.twofa.verifyTOTP(user.twoFA.secretEnc, token);
        else if (backupCode) {
            valid = await Auth.twofa.verifyBackupCode(
                backupCode,
                user.twoFA.backupCodesHash
            );
        }

        if (!valid) return res.status(401).json({ error: "Invalid 2FA proof" });

        user.twoFA.enabled = false;
        user.twoFA.secretEnc = null;
        user.twoFA.backupCodesHash = [];
        await user.save();

        res.json({ message: "2FA disabled successfully" });
    } catch (error) {
        console.error("Disable 2FA error: ", error);
        res.status(500).json({ error: "server error" });
    }
});

router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
    })
);

router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/auth/login",
        session: false,
    }),
    async (req, res) => {
        const user = req.user;

        const accessToken = Auth.tokens.generateAccessToken(user);
        const { refreshToken, opaqueToken, session } =
            await Auth.session.createSession(
                user._id,
                req.ip,
                req.headers["user-agent"] || "unknown"
            );

        res.json({
            accessToken,
            refreshToken,
            opaqueToken,
            sessionId: session.sessionId,
        });
    }
);

router.post("/profile", authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

router.post(
    "/admin",
    authenticateToken,
    authorizeRoles("admin"),
    (req, res) => {
        res.json({ message: "Welcome Admin!" });
    }
);
module.exports = router;
