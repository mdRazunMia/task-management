const express = require("express");
const router = express.Router();
const googleLoginController = require("../controllers/googleLoginController");
// const auth = require("../validations/verify");

router.post("/google-login", googleLoginController.googleLogin);

module.exports = router;
