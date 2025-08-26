const express = require("express");
const router = express.Router();

const authenticateToken = require("../Auth/Middleware/authenticate");
const apps = require("../Modules");

router.use(authenticateToken);

router.get("/:symbol/overview", apps.overviewController.getStockOverview);
router.get(
    "/:symbol/historical",
    apps.historicalController.getHistoricalPerformance
);
router.get("/:symbol/risk", apps.riskController.getRisk);
router.get("/:symbol/technical", apps.technicalController.getTechnical);
router.get("/:symbol/predictions", apps.predictionController.getPredictions);
router.get("/:symbol/news", apps.newsController.getNews);
router.get(
    "/:symbol/financedocs",
    apps.documentController.getFinancialDocuments
);

router.get("/:symbol/summary", apps.aggregateController.getStockSummary);

module.exports = router;
