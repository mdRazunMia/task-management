const mongoose = require("mongoose");

const boardSchema = mongoose.Schema(
  {
    board_title: {
      type: String,
      required: [true, "Board name is required."],
      trim: true,
    },
    nested: {
      type: Boolean,
      default: false,
    },
    super_board: {
      super_board_id: {
        type: String,
        default: null,
      },
      super_board_title: {
        type: String,
        default: null,
      },
    },
    task_list: [
      {
        task_id: {
          type: String,
        },
        task_title: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Board", boardSchema);
