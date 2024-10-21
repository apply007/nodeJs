const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config({ path: "./config.env" });

const app = require("./app");

console.log(app.get("env"));
console.log(process.env);
mongoose
  .connect(process.env.CON_STR, {
    useNewUrlParser: true,
  })
  .then((conn) => {
    console.log("connect successfully ");
    //  console.log(conn);
  })
  .catch((err) => console.log(err.message));

const moviesSchema = new mongoose.Schema({
  name: { type: String, required: [true, "name is required"], unique: true },
  description: { type: String },
  duration: { type: Number, required: [true, "duration is required"] },
  rating: { type: Number, default: 1.0 },
});

const Movie = mongoose.model("movie", moviesSchema);

const testMovie = new Movie({
  name: "Avenger1",
  description: "ksdfhkhfkhasjdkaj",
  duration:0,
  rating: 2.0,
});
testMovie
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => {
    console.log(err);
  });
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("server has started...");
});
