const dayjs = require("dayjs");

const formatDate = (date = new Date()) => dayjs(date).format("YYYY-MM-DD");

const percentChange = (oldValue, newValue) => {
    if (!oldValue || oldValue === 0) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
};

const safeNumber = (value) => {
    if (value == null) return null;

    if (typeof value === "string") return parseFloat(value.replace(/, /g, ""));
    return Number(value);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
    formatDate,
    percentChange,
    safeNumber,
    sleep,
};
