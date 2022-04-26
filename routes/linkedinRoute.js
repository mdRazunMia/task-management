const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const redisInstance = require("../redis/redis");
const logger = require("../logger/logger");
const User = require("../models/userModel");

router.get(
  "/linkedin",
  passport.authenticate("linkedin", {
    scope: ["r_emailaddress", "r_liteprofile"],
  })
);

router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", { failureRedirect: "/auth/linkedInError" }),
  async function (req, res) {
    const redisClient = redisInstance.getRedisClient();
    const userFullName = req.user.displayName;
    const linkedInUserEmail = req.user.emails[0];
    const userEmail = linkedInUserEmail.value;
    const userImagePath = req.user.photos[0].value;
    const linkedInUser = {
      user_name: userFullName,
      user_email: userEmail,
      user_image_path: userImagePath,
      user_login_medium: "linkedIn",
    };
    try {
      const user = await User.findOne({ user_email: userEmail });
      if (!user) {
        const insertedUser = await new User(linkedInUser);
        const insertedUserResponse = await insertedUser.save();
        if (!insertedUserResponse) {
          res.status().send({
            errorMessage: "Something went wrong. User has not been inserted.",
          });
        } else {
          const userId = insertedUserResponse._id;
          console.log(userId);
          const authToken = jwt.sign(
            { userEmail: userEmail, userId: userId },
            process.env.TOKEN_SECRET
          );
          const refreshToken = jwt.sign(
            { userEmail: userEmail, userId: userId },
            process.env.REFRESH_TOKEN_SECRET
          );
          redisClient.set(
            userEmail,
            refreshToken,
            { EX: process.env.REDIS_EXPIRE_TIME },
            (err, reply) => {
              if (err) {
                logger.log({
                  level: "error",
                  message:
                    "Internal error for login user in database. | code: 13-1",
                });
                return res
                  .status(500)
                  .send({ errorMessage: "Something went wrong." });
              }
            }
          );
          logger.log({
            level: "info",
            message:
              "User has been logged in successfully by using google account. | code: 13-2",
          });
          res.status(200).send({
            authToken: authToken,
            refreshToken: refreshToken,
            user: insertedUserResponse,
          });
        }
      } else {
        const authToken = jwt.sign(
          { userEmail: userEmail, userId: user._id },
          process.env.TOKEN_SECRET
        );
        const refreshToken = jwt.sign(
          { userEmail: userEmail, userId: user._id },
          process.env.REFRESH_TOKEN_SECRET
        );
        redisClient.set(
          userEmail,
          refreshToken,
          { EX: process.env.REDIS_EXPIRE_TIME },
          (err, reply) => {
            if (err) {
              logger.log({
                level: "error",
                message:
                  "Internal error for login user in database for google login. | code: 13-3",
              });
              return res
                .status(500)
                .send({ errorMessage: "Something went wrong." });
            }
          }
        );
        logger.log({
          level: "warn",
          message: "User Already exist in this email. | code: 13-4",
        });
        res.status(200).send({
          authToken: authToken,
          refreshToken: refreshToken,
          user: user,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  }
);

module.exports = router;
