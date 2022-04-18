const mongoose = require("mongoose");

const boardSchema = mongoose.Schema(
  {
    board_title: {
      type: String,
      required: [true, "Board name is required."],
      trim: true,
    },
    column_order: {
      type: Array,
      default: [],
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

module.exports = mongoose.model("Board", boardSchema);
