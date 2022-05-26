const mongoose = require("mongoose");

const TaskSchema = mongoose.Schema(
  {
    task_title: {
      type: String,
      required: [true, "The task is required."],
      trim: true,
    },
    task_complete: {
      type: Boolean,
      default: false,
    },
    task: {
      type: Boolean,
      default: true,
    },
    user_id: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Task", TaskSchema);
