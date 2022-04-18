const mongoose = require("mongoose");

const TaskSchema = mongoose.Schema(
  {
    task_title: {
      type: String,
      required: [true, "The task is required."],
      trim: true,
    },
    boardId: {
      type: Number,
      required: true,
    },
    columnId: {
      type: Number,
      required: true,
    },
    cover: {
      type: String,
      default: null,
    },
    _destroy: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Task", TaskSchema);
