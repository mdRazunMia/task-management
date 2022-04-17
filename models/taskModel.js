const mongoose = require("mongoose");

const TaskSchema = mongoose.Schema(
  {
    task: {
      type: String,
      required: [true, "The task is required."],
      trim: true,
    },
    day: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Task", TaskSchema);
