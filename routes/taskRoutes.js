const express = require("express");
const router = express();

const taskController = require("../controllers/taskController");

router.post("/create", taskController.createTask);
router.get("/list", taskController.getTasks);
router.get("/list/:id", taskController.getSingleTask);
router.delete("/delete/:id", taskController.deleteSingleTask);
router.put("/edit/:id", taskController.editTask);

module.exports = router;
