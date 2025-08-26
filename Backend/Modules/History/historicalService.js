const { getMockHistoricalPerformance } = require("./mockHistory");

async function getHistoricalPerformanceService(symbol) {
    return Promise.resolve(getMockHistoricalPerformance(symbol));
}

module.exports = { getHistoricalPerformanceService };
