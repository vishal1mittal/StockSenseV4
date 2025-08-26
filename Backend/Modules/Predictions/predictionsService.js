const { getMockPredictions } = require("./mockPredictions");

async function getPredictionsService(symbol) {
    return Promise.resolve(getMockPredictions(symbol));
}

module.exports = { getPredictionsService };
