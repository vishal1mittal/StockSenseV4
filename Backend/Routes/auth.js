const express = require("express");
const router = express.Router();

const User = require("../Auth/Models/User");
const Auth = require("../Auth/Services");
const authenticateToken = require("../Auth/Middleware/authenticate");
const authorizeRoles = require("../Auth/Middleware/authorize");

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
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user)
            return res.status(401).json({ error: "Invalid credentials" });

        const ok = await verifyPassword(user.passwordHash, password);

        if (!ok) return res.status(401).json({ error: "Invalid credentials" });

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

router.post("/profile", authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

router.get("/admin", authenticateToken, authorizeRoles("admin"), (req, res) => {
    res.json({ message: "Welcome Admin!" });
});
module.exports = router;
