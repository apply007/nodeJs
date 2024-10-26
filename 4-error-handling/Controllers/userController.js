const User = require("./../Models/userModel");
const asyncErrorHandler = require("./../Utils/asyncErrorHandler");
const jwt = require("jsonwebtoken");
const util = require("util");
const sendEmail = require("./../Utils/email");
const CustomError = require("./../Utils/CustomError");
const crypto = require("crypto");
const authController = require("./authController");

const filterReqObj = (obj, ...allowFields) => {
  const newObj = {};
  Object.keys(obj).forEach((prop) => {
    if (allowFields.includes(prop)) {
      newObj[prop] = obj[prop];
    }
  });
  return newObj;
};
const signToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    process.env.SECRET_STR,
    {
      expiresIn: process.env.LOGIN_EXPIRES,
    }
  );
};

const createSendResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
};
exports.updatePassword = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");
  if (
    !(await user.comparePasswordInDb(req.body.currentPassword, user.password))
  ) {
    return next(new CustomError("current password is wrong", 401));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  createSendResponse(user, 200, res);
});

exports.updateMe = asyncErrorHandler(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword) {
    return next(new CustomError("Cant update password", 400));
  }
  const filterObj = filterReqObj(req.body, "name", "email");

  const user = await User.findByIdAndUpdate(req.user._id, filterObj, {
    runValidators: true,
    new: true,
  });
  await user.save();
});
