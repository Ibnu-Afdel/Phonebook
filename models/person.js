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
  name: {
    type: String,
    minLength: 5,
    required: true,
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: function (value) {
        return /^\d{2,3}-\d+$/.test(value);
      },
      message: (props) =>
        `${props.value} is not valid phone number (use : 09-123456) !`,
    },
  },
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
