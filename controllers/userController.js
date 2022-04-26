const User = require("../models/userModel");
const redisInstance = require("../redis/redis");
const logger = require("../logger/logger");
const jwt = require("jsonwebtoken");

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

const userRefreshToken = async (req, res) => {
  const redisClient = redisInstance.getRedisClient();
  const refreshToken = req.header("refresh-token");
  if (!refreshToken) {
    logger.log({
      level: "error",
      message: "Access denied because token is not available. | code: 10-1",
    });
    return res.status(401).send({ errorMessage: "Access Denied." });
  }
  const verified = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  const userEmail = verified.userEmail;
  const redisUserEmail = await redisClient.get(userEmail);
  if (redisUserEmail === null) {
    logger.log({
      level: "info",
      message: "Login first before get refresh token. | code: 10-4",
    });
    return res.status(401).send({ errorMessage: "Please login first" });
  } else {
    try {
      const authToken = jwt.sign(
        { userEmail: userEmail },
        process.env.TOKEN_SECRET,
        { expiresIn: process.env.JWT_EXPIRE_TIME }
      );
      logger.log({
        level: "info",
        message:
          "Authentication and refresh token have been sent. | code: 10-5",
      });
      res.status(200).send({ authToken: authToken });
    } catch (error) {
      logger.log({
        level: "error",
        message: "Internal error in refresh token function. | code: 10-6",
      });
      res
        .status(500)
        .send({ userRefreshTokenErrorMessage: "Something went wrong." });
    }
  }
};

const userLogOut = (req, res) => {
  const redisClient = redisInstance.getRedisClient();
  const userEmail = req.user.userEmail;
  redisClient.del(userEmail);
  logger.log({
    level: "info",
    message: "User has been logged out successfully. | 12-1",
  });
  res
    .status(200)
    .send({ userLogoutMessage: "User has been logged out successfully." });
};

module.exports = {
  createUser,
  getUsers,
  getSingleUser,
  editUser,
  deleteSingleUser,
  userRefreshToken,
  userLogOut,
};
