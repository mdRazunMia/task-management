const mongoose = require("mongoose");
require("dotenv").config();
const uri = `${process.env.MONGO_BASE_URL}${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rv6z4.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Mongodb connected successfully");
  const express = require("express");
  const bodyParser = require("body-parser");
  const cors = require("cors");
  const cookieParser = require("cookie-parser");
  const session = require("express-session");
  const passport = require("passport");
  const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;

  const taskRoute = require("./routes/taskRoutes");
  const groupRoute = require("./routes/groupRoutes");

  const app = express();
  app.use(cookieParser());
  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        // callback(new error("Not allowed by CORS"));
        callback("Not allowed by CORS");
      }
    },
    credentials: true,
  };
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  app.get("/", () => {
    console.log("This is the task management server.");
  });

  //routes
  app.use("/task", taskRoute);
  app.use("/group", groupRoute);

  app.listen(process.env.PORT, () => {
    console.log(
      `task-management server is running on prot : ${process.env.PORT}`
    );
  });
});
