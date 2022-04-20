const express = require("express");
const router = express();

const boardController = require("../controllers/boardController");

router.post("/create", boardController.createBoard);
router.get("/list", boardController.getBoards);
router.get("/list/:id", boardController.getSingleBoard);
router.delete("/delete/:id", boardController.deleteSingleBoard);
router.put("/edit/:id", boardController.editBoard);
router.put("/add-task/:id", boardController.addTaskToColumn);

module.exports = router;
