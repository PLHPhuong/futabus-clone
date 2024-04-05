const express = require("express");
const colors = require("colors");
const dotenv = require("dotenv").config();

const connectToMongoDB = require("./configs/mongoConnection.js")

// Grobal variables
const PORT = process.env.SERVER_PORT || 5000;

connectToMongoDB()

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: "true" }));



app.use("/api", require("./routes/index.js"));

app.listen(PORT, () =>
    console.log(`Server start on port ${PORT}`.bgYellow.cyan)
);
