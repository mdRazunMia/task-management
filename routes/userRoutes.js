const express = require("express");
const router = express();

const userController = require("../controllers/userController");
const authTokenVerify = require("../jwtVerify/authTokenVerify");
const refreshTokenVerify = require("../jwtVerify/refreshTokenVerify");

router.post("/create", userController.createUser);
router.get("/list", authTokenVerify, userController.getUsers);
router.get("/list/:id", authTokenVerify, userController.getSingleUser);
router.delete("/delete/:id", authTokenVerify, userController.deleteSingleUser);
router.put("/edit/:id", authTokenVerify, userController.editUser);
router.get(
  "/refresh-token",
  refreshTokenVerify,
  userController.userRefreshToken
);
router.get("/logout", refreshTokenVerify, userController.userLogOut);
module.exports = router;
