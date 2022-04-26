const express = require("express");
const router = express();

const taskController = require("../controllers/taskController");
const authTokenVerify = require("../jwtVerify/authTokenVerify");

router.post("/create", authTokenVerify, taskController.createTask);
router.get("/list", authTokenVerify, taskController.getTasks);
router.get("/list/:id", authTokenVerify, taskController.getSingleTask);
router.delete("/delete/:id", authTokenVerify, taskController.deleteSingleTask);
router.put("/edit/:id", authTokenVerify, taskController.editTask);
router.put("/complete/:id", authTokenVerify, taskController.completedTask);
router.get(
  "/all-completed-tasks",
  authTokenVerify,
  taskController.getCompletedTasks
);

module.exports = router;
