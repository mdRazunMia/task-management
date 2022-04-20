const express = require("express");
const router = express.Router();

const groupController = require("../controllers/groupController");

router.post("/create", groupController.createGroup);
router.get("/list", groupController.getGroups);
router.get("/list/:id", groupController.getSingleGroup);
router.delete("/delete/:id", groupController.deleteGroup);
router.put("/edit/:id", groupController.editGroup);

router.put(
  "/add-task/:group_id/:super_group_id",
  groupController.addTaskToGroup
);

module.exports = router;
