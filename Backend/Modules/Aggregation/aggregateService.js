const overviewService = require("../Overview/overviewService");
const historicalService = require("../History/historicalService");
const riskService = require("../Risks/riskService");
const technicalService = require("../TechnicalIndicators/technicalService");
const predictionService = require("../Predictions/predictionsService");
const newsService = require("../News/newsService");
const financialDocumentsService = require("../Documents/financialDocumentsService");

async function buildSummary(symbol) {
    const ov = await overviewService.getStockOverviewService(symbol);
    const hist = await historicalService.getHistoricalPerformanceService(
        symbol
    );
    const risk = await riskService.getRiskService(symbol);
    const tech = await technicalService.getTechnicalService(symbol);
    const pred = await predictionService.getPredictionsService(symbol);
    const news = await newsService.getNewsService(symbol);
    const docs = await financialDocumentsService.getFinancialDocumentsService(
        symbol
    );

    return {
        symbol: ov.symbol,
        currency: ov.currency,
        companyName: ov.companyName,
        overview: ov.overview,
        historicalPerformance: hist.historicalPerformance,
        riskAnalysis: risk.riskAnalysis,
        technicalLevels: tech.technicalLevels,
        aiPredictions: pred.aiPredictions,
        news: news.news,
        financialDocuments: docs.financialDocuments,
    };
}

module.exports = { buildSummary };
