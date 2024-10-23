const User = require("./../Models/userModel");
const asyncErrorHandler = require("./../Utils/asyncErrorHandler");
const jwt = require("jsonwebtoken");

const CustomError = require("./../Utils/CustomError");

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

exports.signup = asyncErrorHandler(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const token = signToken(newUser._id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = asyncErrorHandler(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  //const {email,password}=req.body

  if (!email || !password) {
    const error = new CustomError("Please provide email and password", 400);
    return next(error);
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePasswordInDb( password,user.password))) {
    const error = new CustomError("Incorrect email password", 400);
    return next(error);
  }
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
    user: user,
  });
});
