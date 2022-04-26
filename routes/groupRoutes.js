const express = require("express");
const router = express.Router();

const groupController = require("../controllers/groupController");
const authTokenVerify = require("../jwtVerify/authTokenVerify");

router.post("/create", authTokenVerify, groupController.createGroup);
router.get("/list", authTokenVerify, groupController.getGroups);
router.get("/list/:id", authTokenVerify, groupController.getSingleGroup);
router.delete("/delete/:id", authTokenVerify, groupController.deleteGroup);
router.put("/edit/:id", authTokenVerify, groupController.editGroup);

router.put(
  "/add-task/:group_id/:super_group_id",
  authTokenVerify,
  groupController.addTaskToGroup
);

module.exports = router;
