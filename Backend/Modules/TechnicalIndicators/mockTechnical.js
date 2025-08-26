function getMockTechnical(symbol) {
    return {
        technicalLevels: {
            currentPrice: 175.43,
            dailyLevels: {
                support: [172.5, 170.25, 168.8],
                resistance: [178.9, 181.25, 184.5],
            },
            weeklyLevels: {
                support: [165.0, 160.5, 155.75],
                resistance: [185.0, 190.25, 195.5],
            },
            indicators: {
                rsi: 68.5,
                macd: "Bullish",
                trend: "Upward",
            },
        },
    };
}

module.exports = { getMockTechnical };
