const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    user_name: {
      type: String,
      required: [true, "User name is required."],
      trim: true,
      maxlength: [40, "User name cannot be greater than 40 characters."],
      minlength: [3, "User name cannot be less than 3 characters."],
    },
    user_email: {
      type: String,
      required: [true, "User email is required."],
      trim: true,
    },
    user_image_path: {
      type: String,
      required: true,
    },
    user_login_medium: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("User", UserSchema);
