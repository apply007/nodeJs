//IMPORT PACKAGE
const express = require("express");
const morgan = require("morgan");
const moviesRouter = require("./Routes/moviesRoutes");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const authRouter = require("./Routes/authRouter");
const userRouter = require("./Routes/userRoute");
const CustomError = require("./Utils/CustomError");
const globalErrorHandler = require("./Controllers/errorController");

let app = express();

app.use(helmet());

let limiter = rateLimit({
  max: 3,
  windowMs: 60 * 60 * 1000,
  messages: " we have received too many req in 1 hour",
});

app.use("/api", limiter);
app.use(
  express.json({
    limit: "10kb",
  })
);

app.use(express.static("./public"));

//USING ROUTES

app.use("/api/v1/movies", moviesRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.all("*", (req, res, next) => {
  // res.status(404).json({
  //     status: 'fail',
  //     message: `Can't find ${req.originalUrl} on the server!`
  // });
  // const err = new Error(`Can't find ${req.originalUrl} on the server!`);
  // err.status = 'fail';
  // err.statusCode = 404;
  const err = new CustomError(
    `Can't find ${req.originalUrl} on the server!`,
    404
  );
  next(err);
});

app.use(globalErrorHandler);

module.exports = app;
