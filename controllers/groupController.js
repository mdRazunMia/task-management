const Group = require("../models/groupModel");
const Task = require("../models/taskModel");
const groupInputValidation = require("../validations/groupInputValidation");
const logger = require("../logger/logger");

// const createGroup = async (req, res) => {
//   const { error, value } = groupInputValidation.groupCreateInputValidation({
//     group_title: req.body.group_title,
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
//     const groupObject = {
//       group_title: value.group_title,
//       nested: req.body.nested,
//     };
//     var superGroup;

//     if (req.body.nested == true) {
//       superGroup = {
//         super_group_id: req.body.super_group_id,
//         super_group_title: req.body.super_group_title,
//         super_group_task_list: [],
//       };
//       groupObject.super_group = superGroup;
//     }

//     // if (req.body.nested == true) {
//     // const super_group_id = req.body.super_group_id;
//     // console.log(super_group_id);
//     // const group_task_list = await Group.findOne(
//     //   { _id: super_group_id },
//     //   {
//     //     group_task_list: 1,
//     //     _id: 0,
//     //   }
//     // );
//     // superGroup = {
//     //   super_group_id: req.body.super_group_id,
//     //   super_group_title: req.body.super_group_title,
//     //   super_group_task_list: [],
//     // };
//     // var get_task_list = [];
//     // const tasks = group_task_list.group_task_list;
//     // const length = tasks.length;
//     // console.log(`length: ${length}`);
//     // if (length > 0) {
//     // tasks.map((task) => get_task_list.push(task));
//     // await Group.findOneAndUpdate(
//     //   { _id: super_group_id },
//     //   {
//     //     $push: {
//     //       "super_group.$[].super_group_task_list": get_task_list,
//     //     },
//     //   }
//     // );

//     //   tasks.map(async (task) => {
//     //     await Group.updateOne(
//     //       { _id: super_group_id },
//     //       {
//     //         $push: {
//     //           "super_group.super_group_task_list": {
//     //             task_id: task.task_id,
//     //             task_title: task.task_title,
//     //           },
//     //         },
//     //       }
//     //     );
//     //   });
//     // }

//     // groupObject.super_group = superGroup;
//     // }

//     const group = new Group(groupObject);
//     const saveGroup = await group.save();
//     if (!saveGroup) {
//       res.status(204).send({
//         errorMessage: "Something went wrong. Group does not created.",
//       });
//     } else {
//       console.log(saveGroup);
//       res.status(201).send({ message: "Group has been created successfully." });
//     }
//   }
// };

// newly createdGroup based on new model
const createGroup = async (req, res) => {
  const { error, value } = groupInputValidation.groupCreateInputValidation({
    group_title: req.body.group_title,
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
      const super_group_id = req.body.super_group_id;
      // const super_group_title = req.body.super_group_title;
      const sub_group_title = value.group_title;

      console.log(super_group_id);
      console.log(sub_group_title);

      try {
        const updatedSubGroupList = await Group.findByIdAndUpdate(
          {
            _id: super_group_id,
          },
          {
            nested: true,
            $push: {
              sub_group: {
                sub_group_title: sub_group_title,
                sub_group_task_list: [],
              },
            },
          }
        );
        if (updatedSubGroupList) {
          res
            .status(200)
            .send({ message: "sub-group has been added to the super-group" });
        } else {
          res.status(200).send({
            errorMessage: "sub-group has not been added to the super-group",
          });
        }
      } catch (error) {
        console.log(error.message);
      }
    } else {
      const groupObject = {
        group_title: value.group_title,
        nested: req.body.nested,
        user_id: user_id,
      };
      try {
        const group = new Group(groupObject);
        const saveGroup = await group.save();
        if (!saveGroup) {
          res.status(204).send({
            errorMessage: "Something went wrong. Group does not created.",
          });
        } else {
          console.log(saveGroup);
          res
            .status(201)
            .send({ message: "Group has been created successfully." });
        }
      } catch (error) {
        console.log(error.message);
      }
    }
  }
};

const createGroupBySocket = async (io, group_data) => {
  const { error, value } = groupInputValidation.groupCreateInputValidation({
    group_title: group_data.data.group_title,
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
    const user_id = group_data.userId;
    if (group_data.data.nested == true) {
      const super_group_id = group_data.data.super_group_id;
      const sub_group_title = value.group_title;
      try {
        const updatedSubGroupList = await Group.findByIdAndUpdate(
          {
            _id: super_group_id,
          },
          {
            nested: true,
            $push: {
              sub_group: {
                sub_group_title: sub_group_title,
                sub_group_task_list: [],
              },
            },
          }
        );
        if (updatedSubGroupList) {
          io.emit("createGroup", {
            message: "sub-group has been added to the super-group",
          });
        } else {
          io.emit("createGroup", {
            errorMessage: "sub-group has not been added to the super-group",
          });
        }
      } catch (error) {
        console.log(error.message);
      }
    } else {
      const groupObject = {
        group_title: value.group_title,
        nested: group_data.data.nested,
        user_id: user_id,
      };
      try {
        const group = new Group(groupObject);
        const saveGroup = await group.save();
        if (!saveGroup) {
          io.emit("createGroup", {
            errorMessage: "Something went wrong. Group does not created.",
          });
        } else {
          io.emit("createGroup", {
            message: "Group has been created successfully.",
          });
        }
      } catch (error) {
        console.log(error.message);
      }
    }
  }
};

const addTaskToGroup = async (req, res) => {
  const group_id = req.params.group_id;
  const sub_group_id = req.params.sub_group_id;
  const task_id = req.query.taskId;
  const userId = req.user.userId;
  const task_title = req.body.task_title;
  var task_list = [];
  try {
    const findNestedValue = await Group.findOne(
      { _id: group_id, user_id: userId },
      {
        nested: 1,
        _id: 0,
      }
    );
    if (group_id && sub_group_id != "null" && findNestedValue.nested) {
      const updatedSuperGroupTaskList = await Group.findOneAndUpdate(
        {
          _id: group_id,
          user_id: userId,
          "sub_group._id": sub_group_id,
        },
        {
          $push: {
            "sub_group.$[s].sub_group_task_list": {
              task_id: task_id,
              task_title: task_title,
              user_id: userId,
            },
          },
        },
        {
          arrayFilters: [{ "s._id": sub_group_id }],
        }
      );

      if (updatedSuperGroupTaskList) {
        return res
          .status(201)
          .send({ message: "Task has been added to the sub-group." });
      } else {
        return res.status(500).send({
          errorMessage: "Task has not been added to the group.",
        });
      }
    } else {
      task_list.push({
        task_id: task_id,
        task_title: task_title,
        user_id: userId,
      });
      try {
        const updatedGroupTaskList = await Group.findOneAndUpdate(
          { _id: group_id, user_id: userId },
          { $push: { group_task_list: task_list } }
        );
        console.log(updatedGroupTaskList);
        if (updatedGroupTaskList) {
          return res.status(200).send({
            message: "Task has been added .",
          });
        } else {
          return res
            .status(500)
            .send({ message: "Task has not been added to the group." });
        }
      } catch (error) {
        console.log(error.message);
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const getGroups = async (req, res) => {
  const user_id = req.user.userId;
  try {
    const groupList = await Group.find({ user_id: user_id });
    if (!groupList) {
      res.status(404).send({ message: "There is no group." });
    } else {
      res.status(200).send(groupList);
    }
  } catch (error) {
    console.log(error.message);
  }
};

const getGroupsBySocket = async (io, group_data) => {
  const user_id = group_data.userId;
  try {
    const groupList = await Group.find({ user_id: user_id });
    if (!groupList) {
      io.emit("getGroups", { errorMessage: "There is no group." });
    } else {
      io.emit("getGroups", groupList);
    }
  } catch (error) {
    console.log(error.message);
  }
};

const getSingleGroup = async (req, res) => {
  const id = req.params.id;
  const sub_id = req.query.sub_id;
  const user_id = req.user.userId;
  if (id && sub_id) {
    try {
      const subGroup = await Group.find(
        {
          _id: id,
          user_id: user_id,
          "sub_group._id": sub_id,
        },
        {
          group_title: 1,
          "sub_group.sub_group_title": 1,
          "sub_group.sub_group_task_list": 1,
          "sub_group._id": 1,
        }
      );
      if (!subGroup) {
        res.status(404).send({ message: "Group is not found." });
      } else {
        let newObject = {};
        if (subGroup && subGroup.length > 0) {
          subGroup.map((group) => {
            let sub_group_data = group.sub_group;
            const group_title = group.group_title;
            const group_id = group._id;
            if (sub_group_data && sub_group_data.length > 0) {
              sub_group_data.map((singleSubGroup) => {
                const id = singleSubGroup._id.toString();
                if (id === sub_id) {
                  (newObject.group_title = group_title),
                    (newObject.group_id = group_id),
                    (newObject.sub_group_title =
                      singleSubGroup.sub_group_title),
                    (newObject.sub_group_task_list =
                      singleSubGroup.sub_group_task_list),
                    (newObject._id = singleSubGroup._id);
                }
              });
            }
          });
        }
        console.log(newObject);
        res.status(200).send(newObject);
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    try {
      const group = await Group.findOne({ _id: id, user_id: user_id });
      if (!group) {
        res.status(404).send({ message: "Group is not found." });
      } else {
        res.status(200).send(group);
      }
    } catch (error) {
      console.log(error);
    }
  }
};

const groupTaskComplete = async (req, res) => {
  const user_id = req.user.userId;
  const group_id = req.params.group_id;
  const sub_group_id = req.query.sub_group_id;
  const task_id = req.query.task_id;
  try {
    if (group_id && sub_group_id) {
      const updatedGroupTask = await Group.findOneAndUpdate(
        {
          _id: group_id,
          user_id: user_id,
        },
        {
          $set: {
            "sub_group.$[e].sub_group_task_list.$[s].task_complete": true,
          },
        },
        {
          arrayFilters: [{ "e._id": sub_group_id }, { "s._id": task_id }],
        }
      );
      if (!updatedGroupTask) {
        res.status(500).send({
          errorMessage:
            "Something went wrong. Sub-group task has not been completed.",
        });
      } else {
        res
          .status(200)
          .send({ message: "Sub-group task has been completed successfully." });
      }

      const completedTask = await Task.findOneAndUpdate(
        { _id: task_id, user_id: user_id },
        {
          $set: {
            task_complete: true,
          },
        }
      );
      if (!completedTask) {
        res.status(500).send({
          errorMessage:
            "Something went wrong. Task has not been completed from group task list.",
        });
      } else {
        res.status(200).send({
          message: "Task has been completed successfully from group task list.",
        });
      }
    } else {
      const updatedGroupTask = await Group.findOneAndUpdate(
        {
          _id: group_id,
          user_id: user_id,
          group_task_list: {
            $elemMatch: {
              _id: { $eq: task_id },
            },
          },
        },
        {
          $set: {
            "group_task_list.$.task_complete": true,
          },
        }
      );
      if (!updatedGroupTask) {
        res.status(500).send({
          errorMessage:
            "Something went wrong. Group task has not been completed.",
        });
      } else {
        res
          .status(200)
          .send({ message: "Group task has been completed successfully." });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const getGroupCompletedTasks = async (req, res) => {
  const user_id = req.user.userId;
  const group_id = req.params.group_id;
  const sub_group_id = req.query.sub_group_id;
  if (group_id && sub_group_id) {
    var AllSubGroupTasks = [];
    try {
      const getCompletedGroupTask = await Group.findOne(
        {
          user_id: user_id,
          "sub_group._id": sub_group_id,
          "sub_group.$[].sub_group_task_list.$[].task_complete": true,
        },
        { "sub_group.sub_group_task_list": 1 }
      );
      if (!getCompletedGroupTask) {
        res.status(500).send({
          errorMessage:
            "Something went wrong. Group tasks have not been found.",
        });
      } else {
        const sub_group = getCompletedGroupTask.sub_group;
        if (sub_group && sub_group.length > 0) {
          sub_group.map((group) => {
            const sub_group_tasks = group.sub_group_task_list;
            if (sub_group_tasks && sub_group_tasks.length > 0) {
              sub_group_tasks.map((taskObject) => {
                if (taskObject.task_complete) {
                  AllSubGroupTasks.push(taskObject);
                }
              });
            }
          });
        }
        res.status(200).send({ tasks: AllSubGroupTasks });
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    let allGroupCompletedTasks = [];
    try {
      const getCompletedGroupTasks = await Group.findOne(
        {
          user_id: user_id,
          "group_task_list.task_complete": true,
        },
        { group_task_list: 1 }
      );
      if (!getCompletedGroupTasks) {
        res.status(500).send({
          errorMessage:
            "Something went wrong. Group tasks have not been found.",
        });
      } else {
        const group_tasks = getCompletedGroupTasks.group_task_list;
        if (group_tasks && group_tasks.length > 0) {
          group_tasks.map((task) => {
            if (task.task_complete) {
              allGroupCompletedTasks.push(task);
            }
          });
        }
      }
      res.status(200).send({ tasks: allGroupCompletedTasks });
    } catch (error) {
      console.log(error);
    }
  }
};

// const getGroupCompletedTasks = async (req, res) => {
//   const user_id = req.user.userId;
//   const group_id = req.params.group_id;
//   const sub_group_id = req.query.sub_group_id;
//   let group_completed_tasks = [];
//   let sub_group_completed_tasks = [];
//   try {
//     const getCompletedTasks = await Group.findOne({
//       user_id: user_id,
//       _id: group_id,
//     });
//     if (!getCompletedTasks) {
//       res.status(500).send({
//         errorMessage: "Something went wrong. Group has not been found.",
//       });
//     } else {
//       const group_tasks = getCompletedTasks.group_task_list;
//       const sub_groups = getCompletedTasks.sub_group;
//       if (group_tasks.length > 0) {
//         group_tasks.map((task) => {
//           if (task.task_complete === true) {
//             group_completed_tasks.push(task);
//           }
//         });
//       }

//       sub_groups.map((sub_group) => {
//         // console.log(sub_group);
//         const sub_group_tasks = sub_group.sub_group_task_list;
//         sub_group_tasks.map((task) => {
//           if (task.task_complete === true) {
//             console.log(task);
//             // sub_group_completed_tasks.push(task);
//           }
//         });
//       });
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };

const editGroup = async (req, res) => {
  const { error, value } = groupInputValidation.groupCreateInputValidation({
    group_title: req.body.group_title,
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
    const sub_id = req.query.sub_id;

    if (id && sub_id) {
      try {
        const group = await Group.findOneAndUpdate({
          _id: id,
          user_id: user_id,
          "sub_group._id": sub_id,
        });
        if (!group) {
          return res.status(404).send({ msg: "Group does not exist." });
        } else {
          const updatedSubGroupTitle = await Group.updateOne(
            { _id: id, user_id: user_id, "sub_group._id": sub_id },
            {
              "sub_group.$[].sub_group_title": value.group_title,
            }
          );
          if (!updatedSubGroupTitle) {
            return res.status(204).send({
              msg: "Something went wrong. Sub-group does not updated.",
            });
          } else {
            return res.status(200).send({
              group: updatedSubGroupTitle,
              msg: "Sub-group has been updated successfully.",
            });
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    } else {
      try {
        const group = await Group.find({ _id: id, user_id: user_id });
        if (!group) {
          return res.status(404).send({ msg: "Group does not exist." });
        } else {
          const updatedGroup = await Group.findByIdAndUpdate(
            id,
            { group_title: value.group_title },
            {
              new: true,
              runValidators: true,
            }
          );
          if (!updatedGroup) {
            return res
              .status(204)
              .send({ msg: "Something went wrong. Group does not updated." });
          } else {
            return res.status(200).send({
              group: updatedGroup,
              msg: "Group has been updated successfully.",
            });
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    }
  }
};

const editGroupBySocket = async (io, group_data) => {
  const { error, value } = groupInputValidation.groupCreateInputValidation({
    group_title: group_data.group_title,
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
    io.emit("editGroup", { errorMessage: error.details[0].message });
  } else {
    const group_id = group_data.group_id;
    const sub_group_id = group_data.sub_group_id;
    const user_id = group_data.user_id;
    if (group_id && sub_group_id) {
      try {
        const group = await Group.findOneAndUpdate({
          _id: group_id,
          user_id: user_id,
          "sub_group._id": sub_group_id,
        });
        if (!group) {
          return res.status(404).send({ msg: "Group does not exist." });
        } else {
          const updatedSubGroupTitle = await Group.updateOne(
            { _id: group_id, user_id: user_id, "sub_group._id": sub_group_id },
            {
              "sub_group.$[].sub_group_title": value.group_title,
            }
          );
          if (!updatedSubGroupTitle) {
            io.emit("editGroup", {
              errorMessage: "Something went wrong. Sub-group does not updated.",
            });
          } else {
            io.emit("editGroup", {
              group: updatedSubGroupTitle,
              msg: "Sub-group has been updated successfully.",
            });
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    } else {
      try {
        const group = await Group.find({ _id: group_id, user_id: user_id });
        if (!group) {
          return res.status(404).send({ msg: "Group does not exist." });
        } else {
          const updatedGroup = await Group.findOneAndUpdate(
            { _id: group_id, user_id: user_id },
            { group_title: value.group_title },
            {
              new: true,
              runValidators: true,
            }
          );
          if (!updatedGroup) {
            io.emit("editGroup", {
              errorMessage: "Something went wrong. Group does not updated.",
            });
          } else {
            io.emit("editGroup", {
              group: updatedGroup,
              msg: "Group has been updated successfully.",
            });
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    }
  }
};

const deleteGroup = async (req, res) => {
  const id = req.params.id;
  const user_id = req.user.userId;
  try {
    const getNested = await Group.find(
      { _id: id, user_id: user_id },
      { nested: 1 }
    );
    const getNestedValue = getNested.nested;
    console.log(getNestedValue);
    if (getNestedValue === false) {
      const findGroupTask = await Group.find(
        { _id: id, user_id: user_id },
        {
          group_task_list: 1,
        }
      );
      const groupTaskList = findGroupTask.group_task_list;
      var listOfTaskId = [];
      for (let i in groupTaskList) {
        listOfTaskId.push(groupTaskList[i].task_id);
      }
      console.log(listOfTaskId);
      const deletedTasks = await Task.deleteMany({
        _id: { $in: listOfTaskId },
      });
      if (deletedTasks) {
        res
          .status(200)
          .send({ message: "All the tasks have been deleted successfully." });
      } else {
        res.status(200).send({ ErrorMessage: "Tasks cannot be deleted." });
      }
    } else {
      const findGroupTask = await Group.find(
        { _id: id, user_id: user_id },
        {
          group_task_list: 1,
        }
      );
      const groupTaskList = findGroupTask.group_task_list;
      var listOfGroupTaskId = [];
      for (let i in groupTaskList) {
        listOfGroupTaskId.push(groupTaskList[i].task_id);
      }
      console.log("Group task list: \n" + listOfGroupTaskId);
      const findSuperGroupTask = await Group.find(
        { _id: id, user_id: user_id },
        {
          "super_group.super_group_task_list": 1,
        }
      );
      console.log("super group task object: \n" + findSuperGroupTask);
      const superGroupTaskList =
        findSuperGroupTask.super_group.super_group_task_list;
      console.log("Super group task id list: \n" + superGroupTaskList);
      var listOfSuperGroupTaskId = [];
      for (let i in superGroupTaskList) {
        listOfSuperGroupTaskId.push(superGroupTaskList[i].task_id);
      }

      console.log("List of super group task List: \n" + listOfSuperGroupTaskId);

      //Make a single list from both group and sub-group list
      var taskListId = [...listOfGroupTaskId, ...listOfSuperGroupTaskId];
      let taskListIdSet = new Set(taskListId.map((id) => id));
      let setToTasksListId = [];
      taskListIdSet.forEach((taskId) => setToTasksListId.push(taskId));
      console.log("Set to List: \n" + setToTasksListId);
      const deletedSuperGroupTasks = await Task.deleteMany({
        _id: { $in: setToTasksListId },
      });
      if (deletedSuperGroupTasks) {
        // res
        //   .status(200)
        //   .send({ message: "All the tasks have been deleted successfully." });
        console.log("All the tasks have been deleted successfully");
      } else {
        // res.status(200).send({ ErrorMessage: "Tasks cannot be deleted." });
        console.log("Tasks cannot be deleted.");
      }
    }

    const deletedGroup = await Group.findOneAndDelete({
      _id: id,
      user_id: user_id,
    });
    if (!deletedGroup)
      return res.status(404).json({ msg: "Group does not delete." });
    return res
      .status(200)
      .send({ msg: "Group has been deleted successfully." });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  createGroup,
  getGroups,
  getSingleGroup,
  editGroup,
  deleteGroup,
  addTaskToGroup,
  groupTaskComplete,
  getGroupCompletedTasks,
  getGroupsBySocket,
  createGroupBySocket,
  editGroupBySocket,
};
