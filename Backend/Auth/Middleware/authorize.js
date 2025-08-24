function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const hasRole = req.user.roles.some((role) =>
            allowedRoles.includes(role)
        );

        if (!hasRole) {
            return res.status(403).json({ error: "Forbidden" });
        }

        next();
    };
}

module.exports = authorizeRoles;
