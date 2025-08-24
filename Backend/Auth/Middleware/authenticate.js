const jwt = require("jsonwebtoken");
const User = require("../Models/User");

async function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ error: "No token provided" });

    try {
        const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        const user = await User.findById(payload.uid).select("auth_ver roles");

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        if (user.auth_ver != payload.auth_ver) {
            return res.status(401).json({ error: "Token invalidated" });
        }

        req.user = { id: user._id, roles: user.roles };
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}

module.exports = authenticateToken;
