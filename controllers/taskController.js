const Task = require("../models/taskModel");
const taskInputValidation = require("../validations/taskInputValidation");
const logger = require("../logger/logger");
// const io = require("socket.io");

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
        res.status(201).send({
          message: "Task has been created successfully.",
          task: saveTask,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  }
};

const createTaskBySocket = async (io, task_data) => {
  console.log(task_data);
  const { error, value } = taskInputValidation.taskCreateInputValidation({
    task_title: task_data.taskTitle,
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

    io.emit("addTask", { errorMessage: "Task is not created." });
  } else {
    const task = new Task({
      task_title: value.task_title,
      user_id: task_data.userId,
    });
    try {
      const saveTask = await task.save();
      if (!saveTask) {
        io.emit("addTask", { errorMessage: "Task is not created." });
      } else {
        io.emit("addTask", saveTask);
      }
    } catch (error) {
      console.log(error.message);
    }
  }
};

const getTasks = async (req, res) => {
  const user_id = req.user.userId;
  try {
    const taskList = await Task.find({
      task_complete: false,
      user_id: user_id,
    }).sort({
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
const getTasksBySocket = async (io, task_data) => {
  const user_id = task_data.userId;
  try {
    const taskList = await Task.find({
      task_complete: false,
      user_id: user_id,
    }).sort({
      createdAt: 1,
    });
    if (!taskList) {
      // res.status(404).send({ message: "There is no task." });
      io.emit("getTasks", { errorMessage: "There is no task." });
    } else {
      // res.status(200).send(taskList);
      io.emit("getTasks", taskList);
    }
  } catch (error) {
    console.log(error.message);
  }
};

const getSingleTask = async (req, res) => {
  const id = req.params.id;
  const user_id = req.user.userId;
  try {
    const task = await Task.findOne({ _id: id, user_id: user_id });
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
    const user_id = req.user.userId;
    try {
      const task = await Task.findOne({ _id: id, user_id: user_id });
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
          return res
            .status(204)
            .send({ errorMessage: "Task does not updated." });
        } else {
          return res.status(200).send({
            task: updatedTask,
            message: "Task has been updated successfully.",
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
  const user_id = req.user.userId;
  try {
    const deletedTask = await Task.findOneAndDelete({
      _id: id,
      user_id: user_id,
    });
    if (!deletedTask)
      return res.status(404).send({ msg: "Task does not exist." });
    return res.status(200).send({ msg: "Task has been deleted successfully." });
  } catch (error) {
    console.log(error.message);
  }
};

const deleteSingleTaskBySocket = async (io, task_data) => {
  const id = task_data.id;
  const user_id = task_data.userId;
  try {
    const deletedTask = await Task.findOneAndDelete({
      _id: id,
      user_id: user_id,
    });
    if (!deletedTask) {
      io.emit("deleteTask", { errorMessage: "Task does not deleted." });
    } else {
      io.emit("deleteTask", { message: "Task has been deleted successfully." });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const completedTask = async (req, res) => {
  const task_id = req.params.id;
  const user_id = req.user.userId;
  const findTask = await Task.findOne({ _id: task_id, user_id: user_id });
  if (!findTask) {
    res.status(404).send({ errorMessage: "Task is not available" });
  } else {
    const updatedTask = await Task.findOneAndUpdate(
      { _id: task_id, user_id: user_id },
      { task_complete: true }
    );
    if (!updatedTask) {
      res.status(500).send({
        errorMessage: "Something went wrong. Task has  not been updated.",
      });
    } else {
      const allTask = await Task.find({ task_complete: false });
      res.status(200).send({
        message: "Task has been updated successfully.",
        tasks: allTask,
      });
    }
  }
};

const completedTaskBySocket = async (io, task_data) => {
  const task_id = task_data.id;
  const user_id = task_data.userId;
  const findTask = await Task.findOne({ _id: task_id, user_id: user_id });
  if (!findTask) {
    io.emit("completedTask", { errorMessage: "Task is not available" });
  } else {
    const updatedTask = await Task.findOneAndUpdate(
      { _id: task_id, user_id: user_id },
      { task_complete: true }
    );
    if (!updatedTask) {
      io.emit("completedTask", {
        errorMessage: "Something went wrong. Task has  not been updated.",
      });
    } else {
      const allTask = await Task.find({ task_complete: false });
      io.emit("completedTask", {
        tasks: allTask,
      });
    }
  }
};

const getCompletedTasks = async (req, res) => {
  const user_id = req.user.userId;
  try {
    const allCompletedTask = await Task.find({
      task_complete: true,
      user_id: user_id,
    }).sort({
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

const getCompletedTasksBySocket = async (io, task_data) => {
  const user_id = task_data.userId;
  try {
    const allCompletedTask = await Task.find({
      task_complete: true,
      user_id: user_id,
    }).sort({
      updatedAt: -1,
    });
    if (!allCompletedTask) {
      io.emit("getCompletedTasks", {
        errorMessage: "There is no completed task.",
      });
    } else {
      // res.status(200).send(allCompletedTask);
      io.emit("getCompletedTasks", allCompletedTask);
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
  createTaskBySocket,
  getTasksBySocket,
  deleteSingleTaskBySocket,
  completedTaskBySocket,
  getCompletedTasksBySocket,
};
