// require
const Joi = require("joi");
const User = require("../models/userModel.mongo");
// grobal variables
const userJoiSchema = Joi.object({
    phone: Joi.string().required(),
    password: Joi.string().required(),
    email: Joi.string(),
    username: Joi.string(),
    role: Joi.string().valid("admin", "customer"),
}).unknown(true);

const TestcaseInstance = {
    phone: "555-555-5555",
    password: "password123",
    username: "JohnDoe",
    email: "johndoe@gmail.com",
};
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
        const { phone, password, username, email } = requestBody;
        const newUserInfo = { phone, password, username, email };

        const existed = await User.findOne({ phone });
        if (existed) {
            throw new Error("Phone number has been used");
        }
        let newUser = null;
        try {
            newUser = await User.create(newUserInfo);
        } catch (err) {
            throw new Error("Error happenned with DB (mongo)");
        }

        return newUser;
    };
    static delete = async (_id) => {
        try {
            await User.deleteOne({ _id: _id });
        } catch (err) {
            throw new Error("Error happenned with DB (mongo)");
        }
    };
}

module.exports = userService;
