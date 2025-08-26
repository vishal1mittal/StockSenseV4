const { getStockOverviewService } = require("./overviewService");
const { metrics, logger } = require("../../Helper");

const getStockOverview = async (req, res, next) => {
    try {
        var symbol = (req.params.symbol || "").trim().toUpperCase();

        if (!symbol)
            return res.status(400).json({ error: "Symbol is required" });

        const data = await getStockOverviewService(symbol);

        if (metrics?.inc) metrics.inc("stocks_overview_requests");

        res.json(data);
    } catch (err) {
        logger.error({ err: err.message, path: req.path });
        return next(err);
    }
};

module.exports = { getStockOverview };
