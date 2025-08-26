function getMockRisk(symbol) {
    return {
        riskAnalysis: {
            riskScore: 6.8,
            volatility: 24.5,
            beta: 1.2,
            sharpeRatio: 1.45,
            maxDrawdown: 15.2,
            var95: 8.3,
        },
    };
}

module.exports = { getMockRisk };
