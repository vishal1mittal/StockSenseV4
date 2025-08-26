const { getTechnicalService } = require("./technicalService");

async function getTechnical(req, res, next) {
    try {
        const symbol = (req.params.symbol || "").trim().toUpperCase();

        if (!symbol)
            return res.status(400).json({ error: "Symbol is required" });

        const data = await getTechnicalService(symbol);

        return res.json({ symbol: symbol, ...data });
    } catch (err) {
        return next(err);
    }
}

module.exports = { getTechnical };
