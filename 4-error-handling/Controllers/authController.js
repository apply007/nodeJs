const User = require("./../Models/userModel");
const asyncErrorHandler = require("./../Utils/asyncErrorHandler");
const jwt = require("jsonwebtoken");
const util = require("util");
const sendEmail = require("./../Utils/email");
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

  if (!user || !(await user.comparePasswordInDb(password, user.password))) {
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

exports.protect = asyncErrorHandler(async (req, res, next) => {
  const testToken = req.headers.authorization;
  let token;
  if (testToken && testToken.startsWith("Bearer")) {
    token = testToken.split(" ")[1];
  }
  if (!token) {
    next(new CustomError("You are not Logged in", 401));
  }
  const decodedToken = await util.promisify(jwt.verify)(
    token,
    process.env.SECRET_STR
  );
  const user = await User.findById(decodedToken.id);
  if (!user) {
    const error = new CustomError("User with token does not exists", 401);
    next(error);
  }
  const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat);
  if (isPasswordChanged) {
    const error = new CustomError("Password is changed pls login", 401);
    return next(error);
  }
  req.user = user;
  next();
});

// exports.restrict = (...role) => {
//   return (req, res, next) => {
//     //if (req.user.role !== role)
//     if (!role.includes(req.user.role) ) {
//       const error = new CustomError("You are not Authorize", 401);
//       return next(error);
//     }

//     next();
//   };
// };
exports.restrict = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      const error = new CustomError("You are not Authorize", 401);
      return next(error);
    }

    next();
  };
};

exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    const error = new CustomError(
      "We could not find user with given email",
      404
    );
    next(error);
  }
  const resetToken =await user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `We have received password reset request.please use the link \n\n${resetUrl}\n\n valid for 10 min`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Password change req received",
      message: message,
    });
    res.status(200).json({
      status: "success",
      message: "password reset link send to your email",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
   await user.save({ validateBeforeSave: false });
    return next(new CustomError("There was error reset pass..", 500));
  }
});

exports.resetPassword = (req, res, next) => {};
