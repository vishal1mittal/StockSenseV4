function getMockOverview(symbol) {
    return {
        symbol,
        currency: "USD",
        companyName: "Apple Inc.",
        overview: {
            price: 175.43,
            change: 2.34,
            changePercent: 1.35,
            volume: "64.2M",
            marketCap: "2.68T",
            peRatio: 28.45,
            dayRange: "172.80 - 176.90",
        },
    };
}

module.exports = { getMockOverview };
