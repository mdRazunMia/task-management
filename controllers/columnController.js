const Column = require("../models/columnModel");

const createColumn = async (req, res) => {
  const column = new Column(req.body);
  try {
    const saveColumn = await column.save();
    if (!saveColumn) {
      res.status(204).send({
        errorMessage: "Something went wrong. Column does not created.",
      });
    } else {
      console.log(saveColumn);
      res
        .status(201)
        .send({ message: "Column has been created successfully." });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const getColumns = async (req, res) => {
  try {
    const columnList = await Column.find({});
    if (!columnList) {
      res.status(404).send({ message: "There is no column." });
    } else {
      res.status(200).send(columnList);
    }
  } catch (error) {
    console.log(error.message);
  }
};

const getSingleColumn = async (req, res) => {
  const id = req.params.id;
  try {
    const column = await Column.findById(id);
    if (!column) {
      res.status(404).send({ message: "Board is not found." });
    } else {
      res.status(200).send(column);
    }
  } catch (error) {
    console.log(error.message);
  }
};

const editColumn = async (req, res) => {
  const id = req.params.id;
  try {
    const column = await Column.findById(id);
    if (!column) {
      return res.status(404).send({ msg: "Column does not exist." });
    } else {
      const updatedColumn = await Column.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!updatedColumn) {
        return res.status(204).send({ msg: "Board does not updated." });
      } else {
        return res.status(200).send({
          column: updatedColumn,
          msg: "Column has been updated successfully.",
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteSingleColumn = async (req, res) => {
  const id = req.params.id;
  try {
    const deletedColumn = await Column.findByIdAndDelete(id);
    if (!deletedColumn)
      return res.status(404).send({ msg: "Column does not exist." });
    return res
      .status(200)
      .send({ msg: "Column has been deleted successfully." });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  createColumn,
  getColumns,
  getSingleColumn,
  editColumn,
  deleteSingleColumn,
};
