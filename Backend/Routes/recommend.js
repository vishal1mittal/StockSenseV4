const express = require("express");
const router = express.Router();

const { Recommendation } = require("../Recommendation/Recommendation");

router.post("/", async (req, res, next) => {
    try {
        const partialName = req.body.partialName;
        const result = await Recommendation(partialName);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
