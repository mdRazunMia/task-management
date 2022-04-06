const User = require("../models/userModel");

const createUser = async (req, res) => {
  const user = new User(req.body);
  try {
    const saveUser = await user.save();
    if (!saveUser) {
      res.status(204).send({
        errorMessage: "Something went wrong. User does not created.",
      });
    } else {
      console.log(saveUser);
      res.status(201).send({ message: "User has been created successfully." });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const getUsers = async (req, res) => {
  try {
    const userList = await User.find({});
    if (!userList) {
      res.status(404).send({ message: "There is no User." });
    } else {
      res.status(200).send(userList);
    }
  } catch (error) {
    console.log(error.message);
  }
};

const getSingleUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id);
    if (!user) {
      res.status(404).send({ message: "User is not found." });
    } else {
      res.status(200).send(user);
    }
  } catch (error) {
    console.log(error.message);
  }
};

const editUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send({ msg: "User does not exist." });
    } else {
      const updatedUser = await User.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!updatedUser) {
        return res.status(204).send({ msg: "User does not updated." });
      } else {
        return res.status(200).send({
          user: updatedUser,
          msg: "User has been updated successfully.",
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteSingleUser = async (req, res) => {
  const id = req.params.id;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser)
      return res.status(404).send({ msg: "User does not exist." });
    return res.status(200).send({ msg: "User has been deleted successfully." });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  createUser,
  getUsers,
  getSingleUser,
  editUser,
  deleteSingleUser,
};
