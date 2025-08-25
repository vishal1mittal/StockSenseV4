const pino = require("pino");

const logger = pino({
    transport: {
        target: "pino-pretty",
        options: { colorize: true },
    },
    base: null,
    timestamp: () => `, "time": "${new Date().toISOString()}"`,
});

module.exports = logger;
