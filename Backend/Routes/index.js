const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
// const stocksRoutes = require("./stocks");
// const instrumentsRoutes = require("./instruments");
// const recommendRoutes = require("./recommend");

router.use("/auth", authRoutes);
// router.use("/stocks", stocksRoutes);
// router.use("/instruments", instrumentsRoutes);
// router.use("/recommend", recommendRoutes);

// router.use("/health", (req, res) => res.json({ status: "ok" }));

module.exports = router;
