const { getMockTechnical } = require("./mockTechnical");

async function getTechnicalService(symbol) {
    return Promise.resolve(getMockTechnical(symbol));
}

module.exports = { getTechnicalService };
