// require
const Joi = require("joi");
const User = require("../models/userModel.mongo");
const { redisClient } = require("../configs/redisConnection.js");
const UserRedisModel = require("../models/userModel.redis.js");

// grobal variables
// const userJoiSchema = Joi.object({
//     phone: Joi.string().required(),
//     password: Joi.string().required(),
//     email: Joi.string(),
//     username: Joi.string(),
//     role: Joi.string().valid("admin", "customer"),
// }).unknown(true);

const TestcaseInstance = {
    phone: "5555555555",
    password: "password123",
    username: "JohnDoe",
    email: "johndoe@gmail.com",
};

const fieldNames = Object.keys(User.schema.paths); // ["phone","password","username","email","role","_id","__v"];

// Utils function

// implement
class userService {
    static validator = (requestBody) => {
        const validation = userJoiSchema.validate(requestBody);
        let error = null;
        if (validation.error) {
            error = validation.error.details[0].message;
        }
        return error;
    };
    static getAll = async () => {
        return await User.find();
    };
    static create = async (requestBody) => {
        let result = { error: null, data: null };
        // Load variables
        const { phone, password, username, email } = requestBody;
        const newUserInfo = { phone, password, username, email };

        const keyFields = ["phone"];
        const notIncluded = ["password"].concat(keyFields);
        const key = `phone:${phone}`;

        // Check existence


        
        if (await User.findOne({ phone })) {
            throw new Error("Phone number has been used");
        }
        // Insert to mongo
        let newUser = {
            MongoReturn: null,
            Object: null,
        };

        try {
            newUser.MongoReturn = await User.create(newUserInfo);
            newUser.Object = JSON.parse(JSON.stringify(newUser.MongoReturn));
        } catch (err) {
            console.log(err);
            throw new Error("Error happenned with DB (mongo)");
        }
        // Insert to redis
        try {
            if (newUser.Object) {
                const userData = newUser.Object;

                const value = Object.keys(userData).reduce((obj, key) => {
                    if (!notIncluded.includes(key)) {
                        obj[key] = userData[key];
                    }
                    return obj;
                }, {});
                // For redis version 4 or above, HSET can be pair with Object
                await redisClient.HSET(key, "password", password);
                await redisClient.HSET(
                    key,
                    "other-field",
                    JSON.stringify(value)
                );
            }
        } catch (err) {
            // Drop create user in mongo
            newUser.MongoReturn?.deleteOne().catch((error) => {
                console.error(error); // Handle any errors that occur during the deletion
            });
            // Drop created user in redis
            redisClient.exists(key).then((existedKey) => {
                redisClient.del(existedKey).catch((err) => {
                    console.error(err);
                });
            });
            const existedKey = await redisClient.exists(key);
            console.error(err);
            throw new Error("Error happenned with DB (redis)");
        }

        return newUser.Object;
    };

    static delete = async (_id) => {
        try {
            // await User.deleteOne({ _id: _id }); without using redis

            const deleteUser = await User.findById(_id);
            if (deleteUser) {
                const result = await Promise.all(
                    UserRedisModel.deleteByKey(deleteUser),
                    deleteUser.deleteOne()
                );
                console.log(deleteUser);
            }
        } catch (err) {
            throw new Error("Error happenned with DB (mongo)");
        }
    };

    static searchLoginInfo = async (phone, password) => {
        let account = null;

        try {
            account = await User.findOne({ phone: phone, password: password });
        } catch (err) {
            throw new Error(`Error happenned with DB (mongo):\n{err}`);
        }

        return account;
    };
}

module.exports = userService;
