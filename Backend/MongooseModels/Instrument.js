const mongoose = require("mongoose");

const InstrumentSchema = new mongoose.Schema(
    {
        // Common fields
        segment: { type: String, required: true },
        name: { type: String, required: true },
        exchange: { type: String, required: true },
        instrument_key: { type: String, required: true, unique: true },
        asset_symbol: { type: String },
        underlying_symbol: { type: String },
        instrument_type: { type: String }, // CE, PE, EQ, FUT, etc.
        lot_size: { type: Number },
        freeze_quantity: { type: Number },
        exchange_token: { type: String },
        tick_size: { type: Number },
        asset_type: { type: String }, // EQUITY, COM, CUR
        underlying_type: { type: String },
        trading_symbol: { type: String },
        strike_price: { type: Number },
        qty_multiplier: { type: Number },
        expiry: { type: Date }, // store expiry as JS Date

        // Optional fields
        weekly: { type: Boolean },
        minimum_lot: { type: Number },
        asset_key: { type: String },
        underlying_key: { type: String },
        last_trading_date: { type: Date },
        price_quote_unit: { type: String },

        // Safety net for unexpected fields
        extra: { type: mongoose.Schema.Types.Mixed },
    },
    { timestamps: true }
);

const Instrument = mongoose.model("Instrument", InstrumentSchema);

module.exports = Instrument;
