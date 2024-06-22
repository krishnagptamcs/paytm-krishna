const express = require("express");
const userRoute = require("./userRoutes");

const router = express.Router();

router.use("/user", userRoute);

module.exports = router;
