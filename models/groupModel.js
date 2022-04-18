const mongoose = require("mongoose");

const GroupSchema = mongoose.Schema(
  {
    group_title: {
      type: String,
      required: [true, "Group name is required."],
      trim: true,
    },
    nested_group: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Group", GroupSchema);
