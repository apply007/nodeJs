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
  role: {
    type: String,
    enum: ["user", "admin"],
    default:'user'
  },
  photo: String,
  password: {
    type: String,
    required: [true, "Please enter a password."],
    minlength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Please confirm your password."],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: "Password and confirm password does not match",
    },
  },
  passwordChangedAt: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcryptjs.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.comparePasswordInDb = async function (paswd, pswdDB) {
  // const t= await bcryptjs.compare(paswd,pswdDB)
  return await bcryptjs.compare(paswd, pswdDB);
};
userSchema.methods.isPasswordChanged = async function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const passwordChangedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000
    );
    console.log(passwordChangedTimeStamp, JWTTimeStamp);
    return JWTTimeStamp < passwordChangedTimeStamp;
  }
  return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
