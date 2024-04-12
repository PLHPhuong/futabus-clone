const { redisClient } = require("../configs/redisConnection.js");

// Format for usermodel in redis
// phone:<phone number>:password:<password> data {<stringtified dat. Ex: { email: <email>, username: <username>, _id: <_id>}>}
const User = require("./userModel.mongo");
const fieldNames = Object.keys(User.schema.paths); // ["phone","password","username","email","role","_id","__v"];

class UserRedisModel {
    static create = async (userData) => {
        let result = null;
        try {
            const key = `phone:${userData.phone}:password:${userData.password}`;
            const data = Object.keys(fieldNames).reduce((obj, field) => {
                if (!notReturnedFields.includes(field)) {
                    obj[field] = newUser[field];
                }
                return obj;
            }, {});
            console.log(data);
            console.log(typeof data._id);
            await redisClient.hSet(key, data);
            const value = await redisClient.get("key");

            result = value;
        } catch (err) {
            throw err;
        }
        return result;
    };
    static getByKey = async (userData) => {
        const key = `phone:${userData.phone}:password:${userData.password}`;
        let result = null;
        try {
            const value = await redisClient.get("key");
            result = value;
        } catch (err) {
            throw err;
        }
        return result;
    };

    static deleteByKey = async (userData) => {
        const key = `phone:${userData.phone}:password:${userData.password}`;
        try {
            const value = await redisClient.del("key");
            result = value;
        } catch (err) {
            throw err;
        }
    };
}

module.exports = UserRedisModel;
