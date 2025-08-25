const express = require("express");
const router = express.Router();

const { GetInstruments } = require("../Helper/GetInstruments");

router.get("/refresh", async (req, res, next) => {
    try {
        const result = await GetInstruments();
        res.json(result);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
