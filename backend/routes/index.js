const express = require("express");
const userRoute = require("./userRoutes");
const accountRoute = require("./accountRoute");

const router = express.Router();

router.use("/user", userRoute);
router.use("/account", accountRoute);

module.exports = router;
