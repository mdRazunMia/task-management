const Task = require("../models/taskModel");

const createTask = async (req, res) => {
  const task = new Task(req.body);
  try {
    const saveTask = await task.save();
    if (!saveTask) {
      res.status(204).send({
        errorMessage: "Something went wrong. Group does not created.",
      });
    } else {
      console.log(saveTask);
      res.status(201).send({ message: "Group has been created successfully." });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const getTasks = async (req, res) => {
  try {
    const taskList = await Task.find({});
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
  const id = req.params.id;
  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ msg: "Task does not exist." });
    } else {
      const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
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

module.exports = {
  createTask,
  getTasks,
  getSingleTask,
  editTask,
  deleteSingleTask,
};
