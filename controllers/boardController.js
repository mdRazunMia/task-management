const Board = require("../models/boardModel");
const Group = require("../models/groupModel");
const Task = require("../models/taskModel");
const boardInputValidation = require("../validations/boardInputValidation");
const logger = require("../logger/logger");

// const createBoard = async (req, res) => {
//   const { error, value } = boardInputValidation.boardCreateInputValidation({
//     board_title: req.body.board_title,
//   });
//   if (error) {
//     const errors = [];
//     error.details.forEach((detail) => {
//       const currentMessage = detail.message;
//       detail.path.forEach((value) => {
//         logger.log({
//           level: "error",
//           message: `${currentMessage} | Code: 1-1`,
//         });
//         errors.push({ [value]: currentMessage });
//       });
//     });
//     // res.status(422).send({ message: error.details[0].message });
//     res.status(422).send(errors);
//   } else {
//     const boardObject = {
//       board_title: value.board_title,
//       task_list: [],
//     };
//     var boardColumn;
//     if (req.body.nested == true) {
//       boardColumn = {
//         board_column_title: req.body.board_column_title,
//       };
//       boardObject.nested = req.body.nested;
//       boardObject.board_column = boardColumn;
//     }

//     const board = new Board(boardObject);
//     try {
//       const saveBoard = await board.save();
//       if (!saveBoard) {
//         res.status(204).send({
//           errorMessage: "Something went wrong. Board does not created.",
//         });
//       } else {
//         console.log(saveBoard);
//         res
//           .status(201)
//           .send({ message: "Board has been created successfully." });
//       }
//     } catch (error) {
//       console.log(error.message);
//     }
//   }
// };

const createBoard = async (req, res) => {
  const { error, value } = boardInputValidation.boardCreateInputValidation({
    board_title: req.body.board_title,
  });
  if (error) {
    const errors = [];
    error.details.forEach((detail) => {
      const currentMessage = detail.message;
      detail.path.forEach((value) => {
        logger.log({
          level: "error",
          message: `${currentMessage} | Code: 1-1`,
        });
        errors.push({ [value]: currentMessage });
      });
    });
    // res.status(422).send({ message: error.details[0].message });
    res.status(422).send(errors);
  } else {
    const user_id = req.user.userId;
    if (req.body.nested == true) {
      const board_id = req.body.board_id;
      const board_column_title = value.board_title;
      try {
        const updatedBoardColumnList = await Board.findByIdAndUpdate(
          {
            _id: board_id,
          },
          {
            nested: true,
            $push: {
              board_column: {
                board_column_title: board_column_title,
                board_column_task_list: [],
              },
            },
          }
        );
        if (updatedBoardColumnList) {
          res
            .status(200)
            .send({ message: "Column has been added to the board." });
        } else {
          res.status(200).send({
            errorMessage: "Column has not been added to the board.",
          });
        }
      } catch (error) {
        console.log(error.message);
      }
    } else {
      const boardObject = {
        board_title: value.board_title,
        nested: req.body.nested,
        user_id: user_id,
      };
      try {
        const board = new Board(boardObject);
        const saveBoard = await board.save();
        if (!saveBoard) {
          res.status(204).send({
            errorMessage: "Something went wrong. Board does not created.",
          });
        } else {
          console.log(saveBoard);
          res
            .status(201)
            .send({ message: "Board has been created successfully." });
        }
      } catch (error) {
        console.log(error.message);
      }
    }
  }
};

const getGroupsAndTasks = async (req, res) => {
  var groupList = [];
  var taskList = [];
  var allTasksAndGroups = [];
  try {
    const getGroups = await Group.find();
    getGroups.map((group) => {
      var modifiedGroupObject = {
        group_id: group._id,
        group_title: group.group_title,
        group_task_list: group.group_task_list,
        nested: group.nested,
      };
      if (group.nested === true) {
        modifiedGroupObject.sub_group = JSON.parse(
          JSON.stringify(group.sub_group)
        );
      }
      modifiedGroupObject.group = true;
      groupList.push(modifiedGroupObject);
    });
  } catch (error) {
    console.log(error.message);
  }

  try {
    const getTasks = await Task.find();
    getTasks.map((task) => {
      var modifiedTaskObject = {
        task_id: task._id,
        task_title: task.task_title,
        task: true,
      };
      taskList.push(modifiedTaskObject);
    });
  } catch (error) {
    console.log(error.message);
  }

  allTasksAndGroups = [...taskList, ...groupList];
  res.status(200).send(allTasksAndGroups);
};

//have to perform for modified version of the model
// const addTaskToColumn = async (req, res) => {
//   const board_id = req.params.id;
//   const board_column_id = req.query.column_id;
//   const user_id = req.user.userId;
//   console.log(board_column_id);
//   const task_id = req.body.task_id;
//   const task_title = req.body.task_title;
//   var task_list = [];
//   try {
//     const findNestedValue = await Board.findById(board_id, {
//       nested: 1,
//       _id: 0,
//     });
//     console.log(findNestedValue);
//     if (findNestedValue.nested == true) {
//       const updatedBoardColumn = await Board.updateOne(
//         {
//           _id: board_id,
//           "board_column._id": board_column_id,
//         },
//         {
//           $push: {
//             "board_column.$[].board_column_task_list": {
//               task_id: task_id,
//               task_title: task_title,
//             },
//           },
//         }
//       );
//       console.log(updatedBoardColumn);
//       if (!updatedBoardColumn) {
//         return res
//           .status(500)
//           .send({ errorMessage: "Task is not added to the column." });
//       } else {
//         return res
//           .status(200)
//           .send({ message: "Task is added to the column." });
//       }
//     } else {
//       task_list.push({
//         task_id: task_id,
//         task_title: task_title,
//       });
//       const updatedBoardColumn = await Board.findOneAndUpdate(
//         { _id: board_id },
//         { $push: { task_list: task_list } }
//       );
//       if (!updatedBoardColumn) {
//         return res
//           .status(500)
//           .send({ errorMessage: "Task is not added to the board." });
//       } else {
//         return res.status(200).send({ message: "Task is added to the board." });
//       }
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };

const addToBoard = async (req, res) => {
  const data = req.body;
  const board_id = req.params.id;
  const board_column_id = req.query.column_id;
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
            // "board_column.$[].board_column_task_list": {
            //   task_id: task_id,
            //   task_title: task_title,
            // },
            "board_column.$[].board_column_task_list": data,
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
      // task_list.push({
      //   task_id: task_id,
      //   task_title: task_title,
      // });
      const updatedBoardColumn = await Board.findOneAndUpdate(
        { _id: board_id },
        // { $push: { task_list: task_list } }
        { $push: { task_list: data } }
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
  const { error, value } = boardInputValidation.boardCreateInputValidation({
    board_title: req.body.boardName,
  });
  if (error) {
    const errors = [];
    error.details.forEach((detail) => {
      const currentMessage = detail.message;
      detail.path.forEach((value) => {
        logger.log({
          level: "error",
          message: `${currentMessage} | Code: 1-1`,
        });
        errors.push({ [value]: currentMessage });
      });
    });
    // res.status(422).send({ message: error.details[0].message });
    res.status(422).send(errors);
  } else {
    const id = req.params.id;
    const board_title = value.board_title;
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
          return res
            .status(204)
            .send({ ErrorMessage: "Board does not updated." });
        } else {
          return res.status(200).send({
            message: "Board has been updated successfully.",
          });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
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
  // addTaskToColumn,
  getGroupsAndTasks,
  addToBoard,
};
