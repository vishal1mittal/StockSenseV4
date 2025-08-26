const { getRiskService } = require("./riskService");

async function getRisk(req, res, next) {
    try {
        const symbol = (req.params.symbol || "").trim().toUpperCase();

        if (!symbol)
            return res.status(400).json({ error: "Symbol is required" });

        const data = await getRiskService(symbol);

        return res.json({ symbol: symbol, ...data });
    } catch (err) {
        return next(err);
    }
}

module.exports = { getRisk };
