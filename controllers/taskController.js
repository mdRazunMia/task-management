const Task = require("../models/taskModel");
const taskInputValidation = require("../validations/taskInputValidation");
const logger = require("../logger/logger");

const createTask = async (req, res) => {
  const { error, value } = taskInputValidation.taskCreateInputValidation({
    task_title: req.body.taskTitle,
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
    const task = new Task({
      task_title: value.task_title,
      user_id: req.user.userId,
    });
    try {
      const saveTask = await task.save();
      if (!saveTask) {
        res.status(204).send({
          errorMessage: "Something went wrong. Task does not created.",
        });
      } else {
        console.log(saveTask);
        const allTasks = await Task.find();
        res
          .status(201)
          .send({ message: "Task has been created successfully." });
      }
    } catch (error) {
      console.log(error.message);
    }
  }
};

const getTasks = async (req, res) => {
  try {
    const taskList = await Task.find({ task_complete: false }).sort({
      createdAt: 1,
    });
    if (!taskList) {
      res.status(404).send({ message: "There is no task." });
    } else {
      res.status(200).send(taskList);
    }
  } catch (error) {
    console.log(error.message);
  }
};

const getSingleTask = async (req, res) => {
  const id = req.params.id;
  try {
    const task = await Task.findById(id);
    if (!task) {
      res.status(404).send({ message: "Task is not found." });
    } else {
      res.status(200).send(task);
    }
  } catch (error) {
    console.log(error.message);
  }
};

const editTask = async (req, res) => {
  console.log(req.body.task_title);
  const { error, value } = taskInputValidation.taskCreateInputValidation({
    task_title: req.body.task_title,
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
      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({ msg: "Task does not exist." });
      } else {
        const updatedTask = await Task.findByIdAndUpdate(
          id,
          { task_title: value.task_title },
          {
            new: true,
            runValidators: true,
          }
        );
        if (!updatedTask) {
          return res.status(204).send({ msg: "Task does not updated." });
        } else {
          return res.status(200).send({
            task: updatedTask,
            msg: "Task has been updated successfully.",
          });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  }
};

const deleteSingleTask = async (req, res) => {
  const id = req.params.id;
  try {
    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask)
      return res.status(404).send({ msg: "Task does not exist." });
    return res.status(200).send({ msg: "Task has been deleted successfully." });
  } catch (error) {
    console.log(error.message);
  }
};

const completedTask = async (req, res) => {
  const task_id = req.params.id;
  const findTask = await Task.findById(task_id);
  if (!findTask) {
    res.status(404).send({ errorMessage: "Task is not available" });
  } else {
    const updatedTask = await Task.findByIdAndUpdate(
      { _id: task_id },
      { task_complete: true }
    );
    if (!updatedTask) {
      res.status(500).send({
        errorMessage: "Something went wrong. Task has  not been updated.",
      });
    } else {
      res.status(200).send({ message: "Task has been updated successfully." });
    }
  }
};

const getCompletedTasks = async (req, res) => {
  try {
    const allCompletedTask = await Task.find({ task_complete: true }).sort({
      updatedAt: -1,
    });
    if (!allCompletedTask) {
      res.status(400).send({ message: "There is no completed task." });
    } else {
      res.status(200).send(allCompletedTask);
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  createTask,
  getTasks,
  getSingleTask,
  editTask,
  deleteSingleTask,
  completedTask,
  getCompletedTasks,
};
