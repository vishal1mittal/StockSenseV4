const getMockNews = require("./mockNews");

async function getNewsService(symbol) {
    return Promise.resolve(getMockNews(symbol));
}

module.exports = { getNewsService };
