const redis = require("redis");
const redisClient = redis.createClient(process.env.DB_REDIS_URL);

redisClient.on("connect", () => {
    console.log("Connected to Redis".cyan.underline);
});
redisClient.on("error", (err) => {
    console.error("Error connecting to Redis:", err);
});
redisClient.on("close", () => {
    console.log("Disonnected from Redis");
});

const testRedisConnection = async () => {
    await redisClient.connect();
    console.log(redisClient.isOpen)

    await redisClient.quit(() => {
        if (err) {
            console.error("Error quitting Redis:", err);
        } else {
            console.log("Connection to Redis closed");
        }
    });
    console.log(redisClient.isOpen)
};
module.exports = { redisClient, testRedisConnection };
