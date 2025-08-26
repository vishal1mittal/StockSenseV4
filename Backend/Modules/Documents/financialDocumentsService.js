const { getMockFinancialDocuments } = require("./mockFinancialDocuments");

async function getFinancialDocumentsService(symbol) {
    return Promise.resolve(getMockFinancialDocuments(symbol));
}

module.exports = { getFinancialDocumentsService };
