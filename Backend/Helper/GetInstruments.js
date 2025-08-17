const axios = require("axios");
const zlib = require("zlib");
const Instruments = require("../MongooseModels/Instrument");
const Companies = require("../MongooseModels/Companies");

async function GetInstruments() {
    try {
        console.log("Downloading Instruments");

        const response = await axios.get(
            "https://assets.upstox.com/market-quote/instruments/exchange/complete.json.gz",
            { responseType: "arraybuffer" }
        );

        const decompress = zlib.gunzipSync(response.data);

        const instrumentsData = JSON.parse(decompress.toString());

        if (!Array.isArray(instrumentsData)) {
            return {
                success: false,
                message: "Invalid data format: Expected an array",
            };
        }

        console.log(`Downloded ${instrumentsData.length} instruments`);

        const formattedData = instrumentsData.map((item) => ({
            ...item,
            expiry: item.expiry ? new Date(item.expiry) : undefined,
            last_trading_date: item.last_trading_date
                ? new Date(item.last_trading_date)
                : undefined,
        }));

        await Instruments.deleteMany({});
        await Instruments.insertMany(formattedData);
        console.log("Instruments collection updated in Mongo DB");

        // const equityInstruments = formattedData.filter(
        //     (item) => item.instrument_type === "EQ"
        // );

        await Companies.deleteMany({});
        await Companies.insertMany(
            await Instruments.find({ instrument_type: "EQ" }).lean()
        );
        console.log("Companies Collection Updated In MongoDB.");

        return {
            success: true,
            count: formattedData.length,
            message:
                "Instruments and Companies collection updated successfully",
        };
    } catch (error) {
        console.log("Failed to update instruments: ", error.message);

        return {
            success: false,
            message:
                "Failed to update instruments. Using Previous MongoDB data.",
            error: error.message,
        };
    }
}

module.exports = { GetInstruments };
