const mongoose = require("mongoose");

const boardSchema = mongoose.Schema(
  {
    board_name: {
      type: String,
      required: [true, "Board name is required."],
      trim: true,
    },
    group_list: [
      {
        type: String,
      },
    ],
    task_list: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Board", boardSchema);
