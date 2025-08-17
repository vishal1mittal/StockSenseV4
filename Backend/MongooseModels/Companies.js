// MongooseModels/Company.js
const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
    {
        segment: { type: String, required: true },
        name: { type: String, required: true },
        exchange: { type: String, required: true },
        instrument_key: { type: String, required: true, unique: true },
        instrument_type: { type: String, required: true },
        lot_size: { type: Number, default: 1 },
        freeze_quantity: { type: Number, default: 0 },
        exchange_token: { type: String, required: true },
        tick_size: { type: Number, default: 1 },
        trading_symbol: { type: String, required: true },
        qty_multiplier: { type: Number, default: 1 },
        expiry: { type: Date },
        last_trading_date: { type: Date },
        rank_alltime: { type: Number, default: 0 }, // total requests ever
        rank_recent: { type: Number, default: 0 }, // requests in recent period (can reset periodically)
        extra: { type: mongoose.Schema.Types.Mixed }, // for any extra fields
    },
    { timestamps: true }
);

const Companies = mongoose.model("Company", CompanySchema);
module.exports = Companies;
