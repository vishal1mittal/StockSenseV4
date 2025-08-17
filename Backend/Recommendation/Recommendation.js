const mongoose = require("mongoose");
const Companies = require("../MongooseModels/Companies");

async function Recommendation(partialName) {
    try {
        const regex = new RegExp(partialName, "i");

        const results = await Companies.find({
            $or: [
                { name: regex },
                { asset_symbol: regex },
                { underlying_key: regex },
            ],
        })
            .sort({ rank_recent: -1, rank_alltime: -1 })
            .limit(10)
            .lean();

        if (!results || results.length === 0) {
            return {
                success: false,
                message: "No Matches Found",
                data: [],
            };
        }

        return {
            success: true,
            count: results.length,
            data: results,
        };
    } catch (error) {
        console.log("Recommendation Error: ", error);
        return {
            success: false,
            message: `Error Occured: ${error.message}`,
            data: [],
        };
    }
}

module.exports = { Recommendation };
