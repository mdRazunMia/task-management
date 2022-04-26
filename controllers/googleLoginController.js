const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const redisInstance = require("../redis/redis");
const logger = require("../logger/logger");
const User = require("../models/userModel");

const clientAccount = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const googleLogin = async (req, res) => {
  const redisClient = redisInstance.getRedisClient();
  tokenId = req.body.tokenId;
  clientAccount
    .verifyIdToken({ idToken: tokenId, audience: process.env.GOOGLE_CLIENT_ID })
    .then(async (response) => {
      // console.log(response.payload);
      const verifiedEmail = response.payload.email_verified;
      const userFullName = response.payload.name;
      const userEmail = response.payload.email;
      const userImagePath = response.payload.picture;
      const userInformation = {};
      userInformation.user_name = userFullName;
      userInformation.user_email = userEmail;
      userInformation.user_image_path = userImagePath;
      userInformation.user_login_medium = "google";
      if (!verifiedEmail) {
        logger.log({
          level: "warn",
          message: "User google account is not verified. | code: 13-5",
        });
        res
          .status(400)
          .send({ errorMessage: "User google account is not verified." });
      } else {
        try {
          const user = await User.findOne({ user_email: userEmail });
          if (!user) {
            const insertedUser = await new User(userInformation);
            const insertedUserResponse = await insertedUser.save();
            if (!insertedUserResponse) {
              res.status().send({
                errorMessage:
                  "Something went wrong. User has not been inserted.",
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
    });
};

module.exports = {
  googleLogin,
};
