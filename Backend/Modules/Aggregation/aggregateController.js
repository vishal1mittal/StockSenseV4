const aggregateData = require("./aggregateService");

async function getStockSummary(req, res, next) {
    try {
        var symbol = (req.params.symbol || "").trim().toUpperCase();

        if (!symbol)
            return res.status(400).json({ error: "Symbol is required" });

        const data = await aggregateData.buildSummary(symbol);
        return res.json(data);
    } catch (err) {
        return next(err);
    }
}

module.exports = { getStockSummary };
