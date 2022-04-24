const Board = require("../models/boardModel");

const createBoard = async (req, res) => {
  const boardObject = {
    board_title: req.body.board_title,
    nested: req.body.nested,
    task_list: [],
  };
  var boardColumn;
  if (req.body.nested == true) {
    boardColumn = {
      board_column_title: req.body.board_column_title,
    };
    boardObject.board_column = boardColumn;
  }

  const board = new Board(boardObject);
  try {
    const saveBoard = await board.save();
    if (!saveBoard) {
      res.status(204).send({
        errorMessage: "Something went wrong. Board does not created.",
      });
    } else {
      console.log(saveBoard);
      res.status(201).send({ message: "Board has been created successfully." });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addTaskToColumn = async (req, res) => {
  const board_id = req.params.id;
  const board_column_id = req.query.column_id;
  console.log(board_column_id);
  const task_id = req.body.task_id;
  const task_title = req.body.task_title;
  var task_list = [];
  try {
    const findNestedValue = await Board.findById(board_id, {
      nested: 1,
      _id: 0,
    });
    console.log(findNestedValue);
    if (findNestedValue.nested == true) {
      const updatedBoardColumn = await Board.updateOne(
        {
          _id: board_id,
          "board_column._id": board_column_id,
        },
        {
          $push: {
            "board_column.$[].board_column_task_list": {
              task_id: task_id,
              task_title: task_title,
            },
          },
        }
      );
      console.log(updatedBoardColumn);
      if (!updatedBoardColumn) {
        return res
          .status(500)
          .send({ errorMessage: "Task is not added to the column." });
      } else {
        return res
          .status(200)
          .send({ message: "Task is added to the column." });
      }
    } else {
      task_list.push({
        task_id: task_id,
        task_title: task_title,
      });
      const updatedBoardColumn = await Board.findOneAndUpdate(
        { _id: board_id },
        { $push: { task_list: task_list } }
      );
      if (!updatedBoardColumn) {
        return res
          .status(500)
          .send({ errorMessage: "Task is not added to the board." });
      } else {
        return res.status(200).send({ message: "Task is added to the board." });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const getBoards = async (req, res) => {
  try {
    const boardList = await Board.find({});
    if (!boardList) {
      res.status(404).send({ message: "There is no Board." });
    } else {
      res.status(200).send(boardList);
    }
  } catch (error) {
    console.log(error.message);
  }
};

const getSingleBoard = async (req, res) => {
  const id = req.params.id;
  try {
    const board = await Board.findById(id);
    if (!board) {
      res.status(404).send({ message: "Board is not found." });
    } else {
      res.status(200).send(board);
    }
  } catch (error) {
    console.log(error.message);
    res.send(error.message);
  }
};

const editBoard = async (req, res) => {
  const id = req.params.id;
  const board_title = req.query.boardName;
  try {
    const board = await Board.findById(id);
    if (!board) {
      return res.status(404).send({ msg: "Board does not exist." });
    } else {
      const updatedBoardInformation = {
        $set: {
          board_title: board_title,
        },
      };
      const updatedBoard = await Board.findByIdAndUpdate(
        { _id: id },
        updatedBoardInformation,
        {
          new: true,
          runValidators: true,
        }
      );
      if (!updatedBoard) {
        return res.status(204).send({ msg: "Board does not updated." });
      } else {
        return res.status(200).send({
          board: updatedBoard,
          msg: "Board has been updated successfully.",
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteSingleBoard = async (req, res) => {
  const id = req.params.id;
  try {
    const deletedBoard = await Board.findByIdAndDelete(id);
    if (!deletedBoard)
      return res.status(404).send({ msg: "Board does not exist." });
    return res
      .status(200)
      .send({ msg: "Board has been deleted successfully." });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  createBoard,
  getBoards,
  getSingleBoard,
  editBoard,
  deleteSingleBoard,
  addTaskToColumn,
};
