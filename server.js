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
  redisDb();
});

//RedisDb
function redisDb() {
  const redisClient = require("./redis/redis");
  redisClient
    .redisConnectAndGetTheInstance()
    .then((res) => {
      console.log("Redis database connect successfully");
      expressServerApp();
    })
    .catch((error) => console.log("Redis database is not connected.", error));
}

//Express server
function expressServerApp() {
  console.log("Mongodb connected successfully");
  const express = require("express");
  const bodyParser = require("body-parser");
  const cors = require("cors");
  const cookieParser = require("cookie-parser");
  const session = require("express-session");

  //routes import
  const taskRoute = require("./routes/taskRoutes");
  const groupRoute = require("./routes/groupRoutes");
  const boardRoute = require("./routes/boardRoutes");
  const userRoute = require("./routes/userRoutes");
  const googleLoginRoute = require("./routes/googleLoginRoute");
  const linkedinLoginRoute = require("./routes/linkedinRoute");

  const taskController = require("./controllers/taskController");
  const groupController = require("./controllers/groupController");
  const boardController = require("./controllers/boardController");

  const passport = require("passport");
  const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;

  const app = express();
  //socket connection
  const server = require("http").createServer(app);
  const io = require("socket.io")(server, {
    cors: {
      // origin: `${process.env.FRONT_END_ORIGIN}`,
      // origin: "http://192.168.68.100:3000",
      origin: "*",
    },
  });
  app.use(function (req, res, next) {
    req.io = io;
    next();
  });
  app.use(cookieParser());
  const whitelist = [`${process.env.BASE_URL_FRONT_END}`];
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
  app.use(
    session({
      secret: "keyboard cat",
      resave: false,
      saveUninitialized: true,
      cookie: { secure: true },
    })
  );
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser((profile, cb) => {
    cb(null, profile);
  });
  passport.deserializeUser((obj, cb) => {
    cb(null, obj);
  });

  app.get("/", () => {
    console.log("This is the task management server.");
  });

  passport.use(
    new LinkedInStrategy(
      {
        clientID: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_SECRET_ID,
        callbackURL: `${process.env.BASE_URL_FRONT_END}/auth/linkedin/callback`,
        scope: ["r_emailaddress", "r_liteprofile"],
      },
      function (accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
          return done(null, profile);
        });
      }
    )
  );

  //routes
  app.use("/task", taskRoute);
  app.use("/group", groupRoute);
  app.use("/board", boardRoute);
  app.use("/user", userRoute);
  app.use("/auth", googleLoginRoute);
  app.use("/auth", linkedinLoginRoute);
  io.on("connection", (socket) => {
    socket.on("addTask", (data) => {
      taskController.createTaskBySocket(io, data);
    });
    socket.on("getTasks", (data) => {
      taskController.getTasksBySocket(io, data);
    });
    socket.on("deleteTask", (data) => {
      taskController.deleteSingleTaskBySocket(io, data);
    });
    // socket.on("completedTask", (data) => {
    //   taskController.completedTaskBySocket(io, data);
    // });

    socket.on("editTask", (data) => {
      taskController.editTaskBySocket(io, data);
    });

    socket.on("getCompletedTasks", (data) => {
      taskController.getCompletedTasksBySocket(io, data);
    });

    socket.on("getGroups", (data) => {
      groupController.getGroupsBySocket(io, data);
    });
    socket.on("createGroup", (data) => {
      groupController.createGroupBySocket(io, data);
    });

    socket.on("createBoard", (data) => {
      boardController.createBoardBySocket(io, data);
    });
    socket.on("getBoards", (data) => {
      boardController.getBoardsBySocket(io, data);
    });
    socket.on("editBoard", (data) => {
      boardController.editBoardBySocket(io, data);
    });
  });
  server.listen(process.env.PORT, () => {
    console.log(
      `task-management server is running on prot : ${process.env.PORT}`
    );
  });
}
