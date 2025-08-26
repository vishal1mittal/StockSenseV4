function getMockPredictions(symbol) {
    return {
        aiPredictions: {
            monthlyPredictions: [
                {
                    date: "2024-01-27",
                    predictedPrice: 178.5,
                    confidence: 78,
                    direction: "up",
                },
                {
                    date: "2024-01-28",
                    predictedPrice: 179.2,
                    confidence: 75,
                    direction: "up",
                },
                {
                    date: "2024-01-29",
                    predictedPrice: 177.8,
                    confidence: 72,
                    direction: "down",
                },
                {
                    date: "2024-01-30",
                    predictedPrice: 180.1,
                    confidence: 70,
                    direction: "up",
                },
                {
                    date: "2024-01-31",
                    predictedPrice: 182.3,
                    confidence: 68,
                    direction: "up",
                },
                {
                    date: "2024-02-01",
                    predictedPrice: 181.9,
                    confidence: 74,
                    direction: "down",
                },
                {
                    date: "2024-02-02",
                    predictedPrice: 183.5,
                    confidence: 72,
                    direction: "up",
                },
                {
                    date: "2024-02-05",
                    predictedPrice: 184.2,
                    confidence: 69,
                    direction: "up",
                },
                {
                    date: "2024-02-06",
                    predictedPrice: 182.8,
                    confidence: 71,
                    direction: "down",
                },
                {
                    date: "2024-02-07",
                    predictedPrice: 185.1,
                    confidence: 66,
                    direction: "up",
                },
                {
                    date: "2024-02-08",
                    predictedPrice: 186.5,
                    confidence: 63,
                    direction: "up",
                },
                {
                    date: "2024-02-09",
                    predictedPrice: 184.9,
                    confidence: 67,
                    direction: "down",
                },
                {
                    date: "2024-02-12",
                    predictedPrice: 187.2,
                    confidence: 65,
                    direction: "up",
                },
                {
                    date: "2024-02-13",
                    predictedPrice: 188.8,
                    confidence: 62,
                    direction: "up",
                },
                {
                    date: "2024-02-14",
                    predictedPrice: 186.7,
                    confidence: 69,
                    direction: "down",
                },
                {
                    date: "2024-02-15",
                    predictedPrice: 189.4,
                    confidence: 61,
                    direction: "up",
                },
                {
                    date: "2024-02-16",
                    predictedPrice: 190.2,
                    confidence: 58,
                    direction: "up",
                },
                {
                    date: "2024-02-20",
                    predictedPrice: 188.6,
                    confidence: 64,
                    direction: "down",
                },
                {
                    date: "2024-02-21",
                    predictedPrice: 191.1,
                    confidence: 57,
                    direction: "up",
                },
                {
                    date: "2024-02-22",
                    predictedPrice: 192.5,
                    confidence: 55,
                    direction: "up",
                },
                {
                    date: "2024-02-23",
                    predictedPrice: 190.8,
                    confidence: 60,
                    direction: "down",
                },
                {
                    date: "2024-02-26",
                    predictedPrice: 185.3,
                    confidence: 68,
                    direction: "down",
                },
            ],
            summary: {
                nextDayPrediction: {
                    direction: "up",
                    confidence: 78,
                    targetPrice: 178.5,
                    reasoning:
                        "Strong technical momentum with positive earnings sentiment",
                },
                weeklyOutlook: {
                    direction: "up",
                    confidence: 65,
                    targetRange: "175-182",
                    keyFactors: [
                        "Earnings beat",
                        "Technical breakout",
                        "Sector rotation",
                    ],
                },
                riskFactors: [
                    "Market volatility ahead of Fed meeting",
                    "High valuation metrics",
                    "Seasonal trading patterns",
                ],
            },
        },
    };
}

module.exports = { getMockPredictions };
