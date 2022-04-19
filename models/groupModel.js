const mongoose = require("mongoose");

const GroupSchema = mongoose.Schema(
  {
    group_title: {
      type: String,
      required: [true, "Group name is required."],
      trim: true,
    },
    group_task: [
      {
        group_task_id: {
          type: String,
          default: null,
        },
        group_task_title: {
          type: String,
          default: null,
        },
      },
    ],
    nested: {
      type: Boolean,
      default: false,
    },
    super_group: {
      super_group_id: {
        type: String,
        default: null,
      },
      super_group_title: {
        type: String,
        trim: true,
        default: null,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Group", GroupSchema);
