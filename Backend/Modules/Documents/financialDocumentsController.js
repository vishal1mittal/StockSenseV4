const { getFinancialDocumentsService } = require("./financialDocumentsService");

async function getFinancialDocuments(req, res, next) {
    try {
        const symbol = (req.params.symbol || "").trim().toUpperCase();

        if (!symbol)
            return res.status(400).json({ error: "Symbol is required" });

        const data = await getFinancialDocumentsService(symbol);

        return res.json({ symbol: symbol, ...data });
    } catch (err) {
        return next(err);
    }
}

module.exports = { getFinancialDocuments };
