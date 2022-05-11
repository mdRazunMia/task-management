// const mongoose = require("mongoose");

// const GroupSchema = mongoose.Schema(
//   {
//     group_title: {
//       type: String,
//       required: [true, "Group name is required."],
//       trim: true,
//     },
//     group_task_list: [
//       {
//         task_id: {
//           type: String,
//           default: null,
//         },
//         task_title: {
//           type: String,
//           default: null,
//         },
//       },
//     ],
//     nested: {
//       type: Boolean,
//       default: false,
//     },
//     super_group: {
//       super_group_id: {
//         type: String,
//         default: null,
//       },
//       super_group_title: {
//         type: String,
//         trim: true,
//         default: null,
//       },
//       super_group_task_list: [
//         {
//           task_id: {
//             type: String,
//           },
//           task_title: {
//             type: String,
//           },
//         },
//       ],
//     },
//     user_id: {
//       type: String,
//     },
//   },
//   {
//     timestamps: true,
//     versionKey: false,
//   }
// );

// module.exports = mongoose.model("Group", GroupSchema);

// modified model

const mongoose = require("mongoose");

const GroupSchema = mongoose.Schema(
  {
    group_title: {
      type: String,
      required: [true, "Group name is required."],
      trim: true,
    },
    group_task_list: [
      {
        task_id: {
          type: String,
          default: null,
        },
        task_title: {
          type: String,
          default: null,
        },
        task_complete: {
          type: Boolean,
          default: false,
        },
        user_id: {
          type: String,
        },
      },
    ],
    nested: {
      type: Boolean,
      default: false,
    },
    sub_group: [
      {
        sub_group_title: {
          type: String,
          trim: true,
          default: null,
        },
        sub_group_task_list: [
          {
            task_id: {
              type: String,
            },
            task_title: {
              type: String,
            },
            task_complete: {
              type: Boolean,
              default: false,
            },
            user_id: {
              type: String,
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Group", GroupSchema);
