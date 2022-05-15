const express = require("express");
const router = express();

const boardController = require("../controllers/boardController");
const authTokenVerify = require("../jwtVerify/authTokenVerify");

router.post("/create", authTokenVerify, boardController.createBoard);
router.get("/list", authTokenVerify, boardController.getBoards);
router.get("/list/:id", authTokenVerify, boardController.getSingleBoard);
router.delete(
  "/delete/:id",
  authTokenVerify,
  boardController.deleteSingleBoard
);
router.put("/edit/:id", authTokenVerify, boardController.editBoard);
// router.put("/add-task/:id", authTokenVerify, boardController.addTaskToColumn);
router.put("/add-task/:id", authTokenVerify, boardController.addToBoard);
router.get(
  "/get-groups-tasks",
  authTokenVerify,
  boardController.getGroupsAndTasks
);
router.put(
  "/delete-board-item/:id",
  authTokenVerify,
  boardController.deleteFromBoard
);

router.put(
  "/edit-column-name/:board_id/:board_column_id",
  authTokenVerify,
  boardController.editBoardColumnName
);

router.put(
  "/move-from-board/:board_id",
  authTokenVerify,
  boardController.moveFromBoard
);

router.put(
  "/move-to-group/:group_id",
  authTokenVerify,
  boardController.moveToGroupOrSubGroup
);

router.put(
  "/single-task-move-from-board/:board_id",
  authTokenVerify,
  boardController.singleTaskMoveFromBroad
);

module.exports = router;
