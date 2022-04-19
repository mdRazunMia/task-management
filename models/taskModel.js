const mongoose = require("mongoose");

const TaskSchema = mongoose.Schema(
  {
    task_title: {
      type: String,
      required: [true, "The task is required."],
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Task", TaskSchema);
