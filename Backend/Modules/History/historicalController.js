const { getHistoricalPerformanceService } = require("./historicalService");

async function getHistoricalPerformance(req, res, next) {
    try {
        var symbol = (req.params.symbol || "").trim().toUpperCase();

        if (!symbol)
            return res.status(400).json({ error: "Symbol is required" });

        const data = await getHistoricalPerformanceService(symbol);

        return res.json({ symbol: symbol, ...data });
    } catch (err) {
        return next(err);
    }
}

module.exports = { getHistoricalPerformance };
