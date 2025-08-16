const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const { HistoricalData } = require("./Modules/HistoricalData");

const app = express();
const port = process.env.PORT;
app.use(cors());

app.get("/", async (req, res) => {
    try {
        const historicalData = await HistoricalData(
            "NSE_FO|106094",
            "days",
            "1",
            "2023-08-16",
            "2025-08-16",
            "HistoricalData.json"
        );
        res.json(historicalData);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to fetch historical data" });
    }

    // res.send(
    //     await HistoricalData(
    //         "NSE_FO|106094",
    //         "days",
    //         "1",
    //         "2023-08-16",
    //         "2025-08-16",
    //         "HistoricalData.json"
    //     )
    // );
});

app.listen(port, () => {
    console.log(`App Listening On Port ${port}`);
});
