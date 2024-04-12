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
    static create = async (requestBody) => {
        // * LOAD & INIT VARIABLES
        const { phone, password, username, email } = requestBody;
        const newUserInfo = { phone, password, username, email };

        const keyFields = ["phone"];
        const notIncluded = ["password"].concat(keyFields);
        const key = `phone:${phone}`;

        let newUser = {
            MongoReturn: null,
            Object: null,
            HasAddedToRedis: false,
        }; // ? for mongo

        try {
            // * CHECK EXISTENCE IN DB
            // if (await User.findOne({ phone })) {
            //     throw new Error("Phone number has been used");
            // }
            const ExitedError = new Error("Phone number has been used");
            if (await redisClient.exists(key)) {
                throw ExitedError;
            }
            if (await User.findOne({ phone })) {
                throw ExitedError;
            }

            // * CREATE NEW USER / ACCOUNT

            // ? Insert data into Mongo
            newUser.MongoReturn = await User.create(newUserInfo);
            newUser.Object = JSON.parse(JSON.stringify(newUser.MongoReturn));

            // ? Insert data into Redis
            // TODO: data current is set to have no expires date => if possible, let set it (cache purpose)
            const userData = newUser.Object;
            // const value = Object.keys(userData).reduce((obj, key) => {
            //     if (!notIncluded.includes(key)) {
            //         obj[key] = userData[key];
            //     }
            //     return obj;
            // }, {});

            // ! For redis version 4 or above, HSET can be pair with Object edisClient.HSET(key, password)
            // await redisClient.HSET(key, "password", password);
            // await redisClient.HSET(key, "other-field", JSON.stringify(value));
            for (let field in userData) {
                if (!["phone"].includes(field)) {
                    await redisClient.HSET(
                        key,
                        field,
                        userData[field] === null ? "null" : userData[field]
                    );
                }
            }
        } catch (error) {
            // ? Print error to console
            console.error(error);

            // ? Drop created "user" if was created in mongo when error happened
            newUser.MongoReturn?.deleteOne().catch((error) => {
                console.error(error); // Handle any errors that occur during the deletion
            });

            // ? Drop created "user" if was created in redis when error happened (doesn't remove if it was in it before call this dunction))
            if (newUser.MongoReturn) {
                redisClient.exists(key).then((existedKey) => {
                    redisClient.del(existedKey).catch((err) => {
                        console.error(err);
                    });
                });
            }

            throw error;
        }

        return newUser.Object;
    };

    static validateLogin = async (requestBody) => {
        // * LOAD & INIT VARIABLES
        const { phone, password } = requestBody;
        let result = null;
        try {
            // * FIND IN REDIS FIRST
            const key = `phone:${phone}`;
            result = await redisClient.hGetAll(key);
            const result_keys = Object.keys(result);
            // * FIND IN MONGO SECOND IF NOT IN REDIS
            if (result_keys.length !== 0 && result["password"] == password) {
                // ? formatting return
                result = result_keys.reduce((obj, field) => {
                    if (result[field] === "null") {
                        obj[field] = null;
                    } else if (["__v"].includes(field)) {
                        obj[field] = parseInt(result[field]);
                    } else {
                        obj[field] = result[field];
                    }
                    return obj;
                }, {});
            } else {
                result = await User.findOne({ phone, password });
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
        // console.log(result);
        return result;
    };

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
