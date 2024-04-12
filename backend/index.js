const express = require("express");
const colors = require("colors");
const dotenv = require("dotenv").config();

const connectToMongoDB = require("./configs/mongoConnection.js");
const {
    redisClient,
    testRedisConnection,
} = require("./configs/redisConnection");
// Grobal variables
const PORT = process.env.SERVER_PORT || 5000;

connectToMongoDB();
// testRedisConnection();
redisClient.connect();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: "true" }));

app.use("/api", require("./routes/index.js"));

app.listen(PORT, () =>
    console.log(`Server start on port ${PORT}`.bgYellow.cyan)
);

// Quitting handle
process.on("exit", () => {
    console.log("Closing Redis connection...");
    if (redisClient.isOpen) redisClient.quit();
    console.log("Redis connection closed.");
});
// Ctrl C
process.on("SIGINT", () => {
    console.log("Received SIGINT. Closing server...");
    app.close(() => {
        console.log("Server closed.");
        process.exit(0);
    });
});
