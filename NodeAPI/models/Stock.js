const mongoose = require("mongoose");

const StockSchema = new mongoose.Schema(
    {
        symbol: String,
        currency: String,
        companyName: String,
        overview: Object,
        historicalPerformance: Object,
        riskAnalysis: Object,
        technicalLevels: Object,
        aiPredictions: Object,
        news: Array,
        financialDocuments: Object,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Stock", StockSchema);
