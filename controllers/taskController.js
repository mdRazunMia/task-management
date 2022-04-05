const Task = require("../models/taskModel");

const createTask = async (req, res) => {
  const task = new Task(req.body);
  const saveTask = await task.save();
  res.json(saveTask);
};

const getTasks = async (req, res) => {
  const taskList = await Task.find({});
  res.json(taskList);
};

const getSingleTask = async (req, res) => {
  const id = req.params.id;
  const task = await Task.findById(id);
  if (!task) {
    res.status(404).send({ message: "Task is not found." });
  } else {
    res.status(200).send(task);
  }
};

const editTask = async (req, res) => {
  const id = req.params.id;
  const task = await Task.findById(id);
  if (!task) {
    return res.status(404).json({ msg: "Task does not exist." });
  } else {
    const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedTask) {
      return res.status(204).json({ msg: "Task does not updated." });
    } else {
      return res.status(200).json({
        task: updatedTask,
        msg: "Task has been updated successfully.",
      });
    }
  }
};

const deleteSingleTask = async (req, res) => {
  const id = req.params.id;
  const deletedTask = await Task.findByIdAndDelete(id);
  if (!deletedTask)
    return res.status(404).json({ msg: "Task does not exist." });
  return res.status(200).json({ msg: "Task has been deleted successfully." });
};

module.exports = {
  createTask,
  getTasks,
  getSingleTask,
  editTask,
  deleteSingleTask,
};
