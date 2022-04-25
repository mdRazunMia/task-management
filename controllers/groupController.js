const Group = require("../models/groupModel");
const Task = require("../models/taskModel");
const groupInputValidation = require("../validations/groupInputValidation");
const logger = require("../logger/logger");
const { RDS } = require("aws-sdk");

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
    const groupObject = {
      group_title: value.group_title,
      nested: req.body.nested,
    };
    var superGroup;

    if (req.body.nested == true) {
      superGroup = {
        super_group_id: req.body.super_group_id,
        super_group_title: req.body.super_group_title,
        super_group_task_list: [],
      };
      groupObject.super_group = superGroup;
    }

    // if (req.body.nested == true) {
    // const super_group_id = req.body.super_group_id;
    // console.log(super_group_id);
    // const group_task_list = await Group.findOne(
    //   { _id: super_group_id },
    //   {
    //     group_task_list: 1,
    //     _id: 0,
    //   }
    // );
    // superGroup = {
    //   super_group_id: req.body.super_group_id,
    //   super_group_title: req.body.super_group_title,
    //   super_group_task_list: [],
    // };
    // var get_task_list = [];
    // const tasks = group_task_list.group_task_list;
    // const length = tasks.length;
    // console.log(`length: ${length}`);
    // if (length > 0) {
    // tasks.map((task) => get_task_list.push(task));
    // await Group.findOneAndUpdate(
    //   { _id: super_group_id },
    //   {
    //     $push: {
    //       "super_group.$[].super_group_task_list": get_task_list,
    //     },
    //   }
    // );

    //   tasks.map(async (task) => {
    //     await Group.updateOne(
    //       { _id: super_group_id },
    //       {
    //         $push: {
    //           "super_group.super_group_task_list": {
    //             task_id: task.task_id,
    //             task_title: task.task_title,
    //           },
    //         },
    //       }
    //     );
    //   });
    // }

    // groupObject.super_group = superGroup;
    // }

    const group = new Group(groupObject);
    const saveGroup = await group.save();
    if (!saveGroup) {
      res.status(204).send({
        errorMessage: "Something went wrong. Group does not created.",
      });
    } else {
      console.log(saveGroup);
      res.status(201).send({ message: "Group has been created successfully." });
    }
  }
};

//newly createdGroup based on new model
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
//     if (req.body.nested == true) {
//       const super_group_id = req.body.super_group_id;
//       // const super_group_title = req.body.super_group_title;
//       const sub_group_title = value.group_title;

//       try {
//         const updatedSubGroupList = await Group.updateOne(
//           {
//             _id: super_group_id,
//           },
//           {
//             $push: {
//               sub_group: {
//                 sub_group_title: sub_group_title,
//                 sub_group_task_list: [],
//               },
//             },
//           }
//         );
//         if (updatedSubGroupList) {
//           res
//             .status(200)
//             .send({ message: "sub-group has been added to the super-group" });
//         } else {
//           res.status(200).send({
//             errorMessage: "sub-group has not been added to the super-group",
//           });
//         }
//       } catch (error) {
//         console.log(error.message);
//       }
//     } else {
//       const groupObject = {
//         group_title: value.group_title,
//         nested: req.body.nested,
//       };
//       try {
//         const group = new Group(groupObject);
//         const saveGroup = await group.save();
//         if (!saveGroup) {
//           res.status(204).send({
//             errorMessage: "Something went wrong. Group does not created.",
//           });
//         } else {
//           console.log(saveGroup);
//           res
//             .status(201)
//             .send({ message: "Group has been created successfully." });
//         }
//       } catch (error) {
//         console.log(error.message);
//       }
//     }
//   }
// };

const addTaskToGroup = async (req, res) => {
  const group_id = req.params.group_id;
  const super_group_id = req.params.super_group_id;
  const task_id = req.body.task_id;
  const task_title = req.body.task_title;

  var task_list = [];
  try {
    const findNestedValue = await Group.findById(group_id, {
      nested: 1,
      _id: 0,
    });
    if (
      group_id &&
      super_group_id !== "null" &&
      findNestedValue.nested === true
    ) {
      const updatedSuperGroupTaskList = await Group.updateOne(
        {
          _id: group_id,
          "super_group._id": super_group_id,
        },
        {
          $push: {
            "super_group.super_group_task_list": {
              task_id: task_id,
              task_title: task_title,
            },
          },
        }
      );

      if (updatedSuperGroupTaskList) {
        return res
          .status(201)
          .send({ message: "Task has been added to the super group." });
      } else {
        return res.status(500).send({
          errorMessage: "Task has not been added to the super group.",
        });
      }
    } else {
      task_list.push({
        task_id: task_id,
        task_title: task_title,
      });
      try {
        const updatedGroupTaskList = await Group.findOneAndUpdate(
          { _id: group_id },
          { $push: { group_task_list: task_list } }
        );
        console.log(updatedGroupTaskList);
        if (updatedGroupTaskList) {
          return res.status(500).send({
            message: "Task has been added to the sub-group.",
          });
        } else {
          return res
            .status(500)
            .send({ message: "Task has not been added to the sub-group." });
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
  try {
    const groupList = await Group.find({});
    if (!groupList) {
      res.status(404).send({ message: "There is no group." });
    } else {
      res.status(200).send(groupList);
    }
  } catch (error) {
    console.log(error.message);
  }
};
const getSingleGroup = async (req, res) => {
  const id = req.params.id;
  try {
    const group = await Group.findById(id);
    if (!group) {
      res.status(404).send({ message: "Group is not found." });
    } else {
      res.status(200).send(group);
    }
  } catch (error) {
    console.log(error.message);
  }
};
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
    try {
      const group = await Group.findById(id);
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
};

const deleteGroup = async (req, res) => {
  const id = req.params.id;
  try {
    const getNested = await Group.findById(id, { nested: 1 });
    const getNestedValue = getNested.nested;
    console.log(getNestedValue);
    if (getNestedValue === false) {
      const findGroupTask = await Group.findById(id, {
        group_task_list: 1,
      });
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
      const findGroupTask = await Group.findById(id, {
        group_task_list: 1,
      });
      const groupTaskList = findGroupTask.group_task_list;
      var listOfGroupTaskId = [];
      for (let i in groupTaskList) {
        listOfGroupTaskId.push(groupTaskList[i].task_id);
      }
      console.log("Group task list: \n" + listOfGroupTaskId);
      const findSuperGroupTask = await Group.findById(id, {
        "super_group.super_group_task_list": 1,
      });
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

    const deletedGroup = await Group.findByIdAndDelete(id);
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
};
