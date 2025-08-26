const { getNewsService } = require("./newsService");

async function getNews(req, res, next) {
    try {
        var symbol = (req.params.symbol || "").trim().toUpperCase();

        if (!symbol)
            return res.status(400).json({ error: "Symbol is required" });

        const data = await getNewsService(symbol);

        return res.json({ symbol, ...data });
    } catch (err) {
        return next(err);
    }
}

module.exports = { getNews };
