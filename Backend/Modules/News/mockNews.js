function getMockNews(symbol) {
    return {
        news: [
            {
                id: 1,
                title: "AAPL Reports Strong Q4 Earnings",
                summary:
                    "Company exceeds analyst expectations with robust revenue growth and improved margins.",
                time: "2 hours ago",
                source: "Financial Times",
                sentiment: "positive",
            },
            {
                id: 2,
                title: "Market Analysis: Tech Sector Outlook",
                summary:
                    "Analysts remain bullish on technology stocks despite recent market volatility.",
                time: "4 hours ago",
                source: "Reuters",
                sentiment: "neutral",
            },
            {
                id: 3,
                title: "Regulatory Update Impacts Sector",
                summary:
                    "New regulations may affect operational costs but long-term outlook remains positive.",
                time: "6 hours ago",
                source: "Bloomberg",
                sentiment: "negative",
            },
        ],
    };
}

module.exports = getMockNews;
