const express = require("express");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const router = express.Router();

const User = require("../Auth/Models/User");
const Auth = require("../Auth/Services");
const authenticateToken = require("../Auth/Middleware/authenticate");
const authorizeRoles = require("../Auth/Middleware/authorize");
const passport = require("../Auth/Strategies/google");
const { otpEmailTemplate } = require("../Helper/emailTemplate");

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

        const otp = crypto.randomInt(100000, 999999).toString();
        const otpHash = await hashPassword(otp);

        const user = await User.create({
            email,
            passwordHash,
            emailVerified: false,
            emailVerificationToken: otpHash,
            emailVerificationExpires: Date.now() + 5 * 60 * 1000,
        });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_ID,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"StockSense" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verify your email",
            html: otpEmailTemplate({ name: email.split("@")[0], otp: otp }),
        });

        res.status(201).json({
            message: "User registered, check your email for OTP",
        });
    } catch (error) {
        console.error("Register error: ", error);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/verifyemail", async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        if (!user.emailVerificationToken) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        if (Date.now() > user.emailVerificationExpires) {
            return res.status(400).json({ error: "OTP expired" });
        }

        const isValid = await verifyPassword(
            user.emailVerificationToken,
            otp.toString()
        );
        if (!isValid) return res.status(400).json({ error: "Invalid OTP" });

        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;

        await user.save();

        res.status(201).json({ message: "Email verified successfully" });
    } catch (error) {
        console.error("Verify email error: ", error);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/resendemailotp", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(201).json({ error: "User not found" });

        if (user.emailVerified) {
            return res.status(400).json({ error: "Email already Verified" });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        const otpHash = await hashPassword(otp);

        user.emailVerificationToken = otpHash;
        user.emailVerificationExpires = Date.now() + 5 * 60 * 1000;

        await user.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_ID,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"StockSense" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verify your email",
            html: otpEmailTemplate({ name: email.split("@")[0], otp: otp }),
        });

        res.status(201).json({ message: "New OTP sent" });
    } catch (error) {
        console.error("Resend verification error: ", error);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password, token, backupCode } = req.body;
        const user = await User.findOne({ email });

        if (!user)
            return res.status(401).json({ error: "Invalid credentials" });

        if (!user.emailVerified) {
            return res.status(403).json({ error: "Email not verified" });
        }

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
        failureRedirect: "/api/auth/login",
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
