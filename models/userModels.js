const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },

  is_admin: {
    type: Number,
    default: 0,
  },
  is_blocked: {
    type: Boolean,
    required: false,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
