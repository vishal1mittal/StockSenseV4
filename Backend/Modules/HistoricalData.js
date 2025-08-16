let UpstoxClient = require("upstox-js-sdk");
const fs = require("fs");
const historicalApiInstance = new UpstoxClient.HistoryV3Api();
async function HistoricalData(
    instrumentId,
    interval,
    duration,
    start,
    end,
    filename
) {
    historicalApiInstance.getHistoricalCandleData1(
        instrumentId,
        interval,
        duration,
        end,
        start,
        (error, data, response) => {
            if (error) {
                console.error(error.response.text);
            } else {
                const jsonData = JSON.stringify(data, null, 2);
                fs.writeFile(filename, jsonData, (err) => {
                    if (err) {
                        console.error("Error writing file:", err);
                        // Handle the error in your Express route, e.g., send an error response
                        return err;
                    }
                    console.log("Data written to file successfully!");
                    // Send a success response in your Express route
                    return jsonData;
                });
            }
        }
    );
}

module.exports = { HistoricalData };
