const express = require("express");
const router = express();

const userController = require("../controllers/userController");

router.post("/create", userController.createUser);
router.get("/list", userController.getUsers);
router.get("/list/:id", userController.getSingleUser);
router.delete("/delete/:id", userController.deleteSingleUser);
router.put("/edit/:id", userController.editUser);

module.exports = router;
