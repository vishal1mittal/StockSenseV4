const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const { ConnectDB } = require("./Database/db");
const { HistoricalData } = require("./Modules/HistoricalData");
const { GetInstruments } = require("./Helper/GetInstruments");
const { Recommendation } = require("./Recommendation/Recommendation");
const authRoutes = require("./Routes/auth");

const app = express();
const port = process.env.PORT;
ConnectDB();

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);

app.get("/refresh-instruments", async (req, res) => {
    const result = await GetInstruments();
    res.json(result);
    // try {
    //     const historicalData = await HistoricalData(
    //         "NSE_FO|106094",
    //         "days",
    //         "1",
    //         "2023-08-16",
    //         "2025-08-16",
    //         "HistoricalData.json"
    //     );
    //     res.json(historicalData);
    // } catch (error) {
    //     console.log(error);
    //     res.status(500).json({ error: "Failed to fetch historical data" });
    // }

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

app.post("/recommend", async (req, res) => {
    console.log(req.body);
    const partialName = req.body.partialName;

    const result = await Recommendation(partialName);
    res.json(result);
});

app.listen(port, () => {
    console.log(`App Listening On Port ${port}`);
});
