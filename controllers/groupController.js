const Group = require("../models/groupModel");

const createGroup = async (req, res) => {
  const group = new Group(req.body);
  const saveGroup = await group.save();
  if (!saveGroup) {
    res
      .status(204)
      .send({ errorMessage: "Something went wrong. Group does not created." });
  } else {
    console.log(saveGroup);
    res.status(201).send({ message: "Group has been created successfully." });
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
  const id = req.params.id;
  try {
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).send({ msg: "Group does not exist." });
    } else {
      const updatedGroup = await Group.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
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
};

const deleteGroup = async (req, res) => {
  const id = req.params.id;
  try {
    const deletedGroup = await Group.findByIdAndDelete(id);
    if (!deletedGroup)
      return res.status(404).json({ msg: "Group does not exist." });
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
};
