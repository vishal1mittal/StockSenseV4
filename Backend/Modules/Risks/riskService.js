const { getMockRisk } = require("./mockRisk");

async function getRiskService(symbol) {
    return Promise.resolve(getMockRisk(symbol));
}

module.exports = { getRiskService };
