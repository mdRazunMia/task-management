const mongoose = require("mongoose");

const columnSchema = mongoose.Schema(
  {
    column_title: {
      type: String,
      required: [true, "Board name is required."],
      trim: true,
    },
    boardId: {
      type: String,
      required: true,
    },
    TaskOrder: {
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

module.exports = mongoose.model("Column", columnSchema);
