const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");

dotenv.config();

const { ConnectDB } = require("./Database/db");
const { logger } = require("./Helper");
const routes = require("./Routes");

const app = express();
const port = process.env.PORT || 8031;

ConnectDB();

app.use(helmet());
app.use(
    cors({ origin: process.env.FRONTEND_ORIGIN || "*", credentials: true })
);
app.use(express.json());

app.use("/api", routes);

app.use((req, res) => res.status(404).json({ error: "Route not found" }));

app.use((err, req, res, next) => {
    logger.error({ err: err.message, path: req.path });
    res.status(err.statusCode || 500).json({
        error: err.message || "Server error",
    });
});

app.listen(port, () => {
    console.log(`App Listening On Port ${port}`);
});
