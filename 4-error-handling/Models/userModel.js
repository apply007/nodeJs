const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");

//name, email, password, confirmPassword, photo
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name."],
  },
  email: {
    type: String,
    required: [true, "Please enter an email."],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid email."],
  },
  photo: String,
  password: {
    type: String,
    required: [true, "Please enter a password."],
    minlength: 8,
  },
  confirmPassword: {
    type: String,
    required: [true, "Please confirm your password."],
  },
});

userSchema.pre("save",async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password =await bcryptjs.hash(this.password, 12);
this.confirmPassword=undefined
next()
});

const User = mongoose.model("User", userSchema);

module.exports = User;
