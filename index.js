require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

const app = express();
app.use(express.json());

morgan.token("body", (request) => {
  return request.method === "POST" ? JSON.stringify(request.body) : "";
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);
app.use(cors());
app.use(express.static("dist"));

app.get("/", (request, response) => {
  response.send("<h1>Hello World</h1>");
});

const errorHandler = (error, request, response, next) => {
  console.log(error.message);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformated id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/info", (request, response) => {
  Person.countDocuments({})
    .then((count) => {
      response.send(
        `<p>Phonebook has started for ${count} people</p> <p>${new Date().toLocaleString()}</p>`
      );
    })
    .catch(() => {
      response.status(500).send({ error: "Database error" });
    });
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => response.json(person))
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response) => {
  Person.findByIdAndDelete(request.params.id).then(() => {
    response.status(204).end();
  });
});

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;

  if (!name || !number) {
    response.status(400).json({ error: "Name and Number are required" });
  }

  const person = { name, number };

  Person.findByIdAndUpdate(request.params.id, person, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedPerson) => {
      if (!updatedPerson) {
        response.status(400).json({ error: "Person not found" });
      }
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const { name, number } = request.body;

  if (!name) {
    return response.status(400).json({ error: "Name Missing" });
  }
  if (!number) {
    return response.status(400).json({ error: "Number Missing" });
  }

  Person.findOne({ name }).then((existingPerson) => {
    if (existingPerson) {
      Person.findByIdAndUpdate(existingPerson.id, { number }, { new: true })
        .then((updatedPerson) => {
          response.json(updatedPerson);
        })
        .catch((error) => next(error));
    } else {
      const person = new Person({
        name,
        number,
      });

      person
        .save()
        .then((savedPerson) => {
          response.json(savedPerson);
        })
        .catch((error) => next(error));
    }
  });
});

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`App running in port ${PORT}`);
});
