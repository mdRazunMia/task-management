const Board = require("../models/boardModel");

const createBoard = async (req, res) => {
  const board = new Board(req.body);
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
  }
};

const editBoard = async (req, res) => {
  const id = req.params.id;
  try {
    const board = await Board.findById(id);
    if (!board) {
      return res.status(404).send({ msg: "Board does not exist." });
    } else {
      const updatedBoard = await Board.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
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
};
