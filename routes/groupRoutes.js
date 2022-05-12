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
  "/add-task/:group_id/:sub_group_id",
  authTokenVerify,
  groupController.addTaskToGroup
);

router.put(
  "/group-task-complete/:group_id",
  authTokenVerify,
  groupController.groupTaskComplete
);

router.get(
  "/get-group-complete-task/:group_id",
  authTokenVerify,
  groupController.getGroupCompletedTasks
);

module.exports = router;
