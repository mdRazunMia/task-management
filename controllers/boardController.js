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
  const user_id = req.user.userId;
  try {
    const getGroups = await Group.find({ user_id: user_id });
    getGroups.map((group) => {
      var modifiedGroupObject = {
        group_id: group._id,
        group_title: group.group_title,
        group_task_list: group.group_task_list,
        nested: group.nested,
        complete: false,
        user_id: group.user_id,
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
    const getTasks = await Task.find({
      user_id: user_id,
      task_complete: false,
    });
    getTasks.map((task) => {
      var modifiedTaskObject = {
        task_id: task._id,
        task_title: task.task_title,
        task: true,
        complete: false,
        user_id: task.user_id,
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
  const user_id = req.user.userId;
  try {
    const findNestedValue = await Board.findOne(
      { _id: board_id, user_id: user_id },
      {
        nested: 1,
        _id: 0,
      }
    );
    console.log(findNestedValue);
    if (findNestedValue.nested == true && board_id && board_column_id) {
      const updatedBoardColumn = await Board.updateOne(
        {
          _id: board_id,
          user_id: user_id,
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
        { _id: board_id, user_id: user_id },
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
const deleteFromBoard = async (req, res) => {
  const board_id = req.params.id;
  const column_id = req.query.column_id;
  const group_or_task_id = req.query.item_id;
  if (req.body.nested === true) {
    if (req.body.group === true) {
      const deletedItemFromBoard = await Board.updateOne(
        { _id: board_id, user_id: user_id, "board_column._id": column_id },
        {
          $pull: {
            // "board_column.$[].board_column_task_list._id":  group_or_task_id
            "board_column.$[].board_column_task_list": {
              group_id: group_or_task_id,
            },
          },
        }
      );
      if (!deletedItemFromBoard) {
        res.status(500).send({
          errorMessage:
            "Something went wrong. Group didn't deleted from the board.",
        });
      } else {
        res
          .status(200)
          .send({ message: "Group has been deleted from the board" });
      }
    } else {
      const deletedItemFromBoard = await Board.updateOne(
        { _id: board_id, user_id: user_id, "board_column._id": column_id },
        {
          $pull: {
            // "board_column.$[].board_column_task_list._id":  group_or_task_id
            // "board_column.board_column_task_list.task_id": group_or_task_id,
            "board_column.$[].board_column_task_list": {
              task_id: group_or_task_id,
            },
          },
        }
      );
      if (!deletedItemFromBoard) {
        res.status(500).send({
          errorMessage:
            "Something went wrong. Task didn't deleted from the board.",
        });
      } else {
        res
          .status(200)
          .send({ message: "Task has been deleted from the board" });
      }
    }
  } else {
    if (req.body.group === true) {
      const deletedItemFromBoard = await Board.updateOne(
        { _id: board_id },
        {
          $pull: {
            // "board_column.$[].board_column_task_list._id":  group_or_task_id
            // "task_list.group_id": group_or_task_id,
            task_list: { group_id: group_or_task_id },
          },
        }
      );
      if (!deletedItemFromBoard) {
        res.status(500).send({
          errorMessage:
            "Something went wrong. Group didn't deleted from the board.",
        });
      } else {
        res
          .status(200)
          .send({ message: "Group has been deleted from the board" });
      }
    } else {
      const deletedItemFromBoard = await Board.updateOne(
        { _id: board_id, "task_list.task_id": group_or_task_id },
        {
          $pull: {
            // "board_column.$[].board_column_task_list._id":  group_or_task_id
            // "task_list.$[].task_id": group_or_task_id,
            task_list: { task_id: group_or_task_id },
          },
        }
      );
      if (!deletedItemFromBoard) {
        res.status(500).send({
          errorMessage:
            "Something went wrong. Task didn't deleted from the board.",
        });
      } else {
        res
          .status(200)
          .send({ message: "task has been deleted from the board" });
      }
    }
  }
};
const getBoards = async (req, res) => {
  const user_id = req.user.userId;
  try {
    const boardList = await Board.find({ user_id: user_id });
    if (!boardList) {
      res.status(404).send({ message: "There is no Board." });
    } else {
      res.status(200).send(boardList);
    }
  } catch (error) {
    console.log(error.message);
  }
};
//have to discuss
const moveFromBoard = async (req, res) => {
  const board_id = req.params.id;
  const column_id = req.query.column_id;
  const task_id = req.query.task_id;
  const user_id = req.user.userId;
  if (board_id && column_id) {
    try {
      const updatedColumnTask = await Board.findOneAndUpdate(
        {
          _id: board_id,
          user_id: user_id,
          "board_column._id": column_id,
        },
        {
          $pull: {
            "board_column.board_column_task_list.$[e]._id": task_id,
          },
        },
        {
          arrayFilters: [{ "e._id": task_id }],
        }
      );
      if (!updatedColumnTask) {
        res
          .status(404)
          .send({ errorMessage: "Something went wrong. Task is not found." });
      } else {
        res.status(200).send(updatedColumnTask);
      }
    } catch (error) {
      console.log(error);
    }
  } else {
  }
};
//have to discuss
const moveToGroupOrSubGroup = async (req, res) => {
  const group_id = req.params.group_id;
  const sub_group_id = req.query.sub_group_id;
  const task_id = req.query.task_id;
  const user_id = req.user.userId;
  if (group_id && sub_group_id) {
  } else {
  }
};

// Pull single board task to the group or sub-group of that board
const singleTaskMoveFromBroad = async (req, res) => {
  const board_id = req.params.board_id;
  const user_id = req.user.userId;
  const bol_task = req.query.task;
  const bol_group = req.query.group;
  if (board_id && bol_task && user_id) {
    const task_id = req.query.task_id;
    try {
      const updatedBoardData = await Board.findOneAndUpdate(
        { _id: board_id, user_id: user_id, "task_list.task_id": task_id },
        {
          $pull: {
            task_list: { task_id: task_id },
          },
        }
      );
      if (!updatedBoardData) {
        res.status(404).send({ errorMessage: "Board is not found." });
      } else {
        res.status(200).send({
          message: "Task has been pulled successfully from the board.",
          updatedTask: updatedBoardData,
        });
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    const group_id = req.query.group_id;
    try {
      const updatedBoardData = await Board.findOneAndUpdate(
        { _id: board_id, user_id: user_id, "task_list.group_id": group_id },
        {
          $pull: {
            task_list: { group_id: group_id },
          },
        }
      );
      if (!updatedBoardData) {
        res.status(404).send({ errorMessage: "Board is not found." });
      } else {
        res.status(200).send({
          message: "Group has been pulled successfully from the board.",
          updatedTask: updatedBoardData,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
};

// Push single board task to the group or sub-group of that board
const singleTaskMoveToBoardGroupFromBoard = async (req, res) => {
  const board_id = req.params.board_id;
  const column_id = req.query.column_id;
  const user_id = req.user.userId;
  const pushed_item = req.body;
  try {
    const getNestedValue = await Board.findOne(
      { _id: board_id, user_id: user_id },
      { nested: 1 }
    );
    if (getNestedValue.nested === true && column_id && board_id) {
      const updatedBoardColumn = await Board.findOneAndUpdate(
        { _id: board_id, user_id: user_id, "board_column._id": column_id },
        {
          $push: {
            "board_column.$[].board_column_task_list": pushed_item,
          },
        }
      );
      if (!updatedBoardColumn) {
        res.status(400).send({
          errorMessage: "Item has not been added to the board column.",
        });
      } else {
        res.status(200).send({
          message: "Item has been added to the board column.",
          data: updatedBoardColumn,
        });
      }
    }
    // else {
    //   console.log(pushed_item);
    //   const updatedBoardColumn = await Board.findOneAndUpdate(
    //     { _id: board_id, user_id: user_id },
    //     {
    //       $push: {
    //         task_list: pushed_item,
    //       },
    //     }
    //   );
    //   if (!updatedBoardColumn) {
    //     res
    //       .status(400)
    //       .send({ errorMessage: "Item has not been added to the board." });
    //   } else {
    //     res.status(200).send(updatedBoardColumn);
    //   }
    // }
  } catch (error) {
    console.log(error);
  }
};

const getSingleBoard = async (req, res) => {
  const id = req.params.id;
  // console.log("Single board id: " + id);
  const user_id = req.user.userId;
  try {
    const board = await Board.findOne({ _id: id, user_id: user_id });
    if (!board) {
      res.status(404).send({ message: "Board is not found." });
    } else {
      res.status(200).send(board);
    }
  } catch (error) {
    console.log(error);
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
    const user_id = req.user.userId;
    try {
      const board = await Board.find({ _id: id, user_id: user_id });
      if (!board) {
        return res.status(404).send({ msg: "Board does not exist." });
      } else {
        const updatedBoardInformation = {
          $set: {
            board_title: board_title,
          },
        };
        const updatedBoard = await Board.findOneAndUpdate(
          { _id: id, user_id: user_id },
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
  const user_id = req.user.userId;
  try {
    const deletedBoard = await Board.findOneAndDelete({
      _id: id,
      user_id: user_id,
    });
    if (!deletedBoard)
      return res.status(404).send({ msg: "Board does not exist." });
    return res
      .status(200)
      .send({ msg: "Board has been deleted successfully." });
  } catch (error) {
    console.log(error.message);
  }
};

const editBoardColumnName = async (req, res) => {};

module.exports = {
  createBoard,
  getBoards,
  getSingleBoard,
  editBoard,
  deleteSingleBoard,
  // addTaskToColumn,
  getGroupsAndTasks,
  addToBoard,
  deleteFromBoard,
  editBoardColumnName,
  moveFromBoard,
  moveToGroupOrSubGroup,
  singleTaskMoveFromBroad,
  singleTaskMoveToBoardGroupFromBoard,
};
