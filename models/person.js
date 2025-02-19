const mongoose = require("mongoose");

const url = process.env.MONGODB_URI;

mongoose.set("strictQuery", false);

console.log("connecting to:", url);
mongoose
  .connect(url)
  .then((result) => {
    console.log("connected to MongoBD");
  })
  .catch((error) => {
    console.log("error connecting to mongodb: ", error.message);
  });

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

personSchema.set("toJSON", {
  transform: (document, resturnedObject) => {
    resturnedObject.id = resturnedObject._id.toString();
    delete resturnedObject._id;
    delete resturnedObject.__v;
  },
});
module.exports = mongoose.model("Person", personSchema);
