const { getMockOverview } = require("./mockOverview");

async function getStockOverviewService(symbol) {
    return Promise.resolve(getMockOverview(symbol));
}

module.exports = { getStockOverviewService };
