module.exports = {
    DEFAULT_CURRENCY: "INR",
    SUPPORTED_MARKETS: ["NSE", "BSE", "NASDAQ", "NYSE"],

    DATE_FORMAT: "YYYY-MM-DD",

    MARKET_HOURS: {
        NSE: { open: "09:15", close: "15:30", tz: "Asia/Kolkata" },
        BSE: { open: "09:15", close: "15:30", tz: "Asia/Kolkata" },
        NASDAQ: { open: "09:30", close: "16:00", tz: "America/New_York" },
        NYSE: { open: "09:30", close: "16:00", tz: "America/New_York" },
    },
};
