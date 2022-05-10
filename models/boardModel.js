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
    board_column: [
      {
        board_column_title: {
          type: String,
          default: null,
        },
        board_column_task_list: [
          // {
          //   task_id: {
          //     type: String,
          //   },
          //   task_title: {
          //     type: String,
          //   },
          // },
        ],
      },
    ],
    task_list: [
      // {
      //   task_id: {
      //     type: String,
      //   },
      //   task_title: {
      //     type: String,
      //   },
      // },
    ],
    user_id: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Board", boardSchema);
