// require
const { request } = require("express");
const userServices = require("../services/userService");
// grobal variables
const TestcaseInstance = {
    phone: "555-555-5555",
    password: "password123",
    username: "JohnDoe",
    email: "johndoe@gmail.com",
};
// Controller's impliments
class userController {
    static validateMiddleware = (req, res, next) => {
        const error = userServices.validator(req.body);
        if (error !== null) {
            res.status(400).json({ message: `Error: ${error}` });
            return;
        }
        next();
    };

    static register = async (req, res) => {
        // * LOAD VARIABLES
        const body = req.body;
        let result = {
            statusCode: 400,
            response: { message: "Unexpected error. Contact dev" },
        };
        let newUser = null;

        // * CREATE A NEW USER (CHECK EXISTENCE TOO) THEN RETURN IF ERROR HAPPENNED
        try {
            newUser = await userServices.create(body);
            if (!newUser) {
                throw new Error(
                    "Something has happenned that cause new account to not be created"
                );
            }
            // ? Filtered what info will return
            const notReturnedFields = ["password"];
            result.response = Object.keys(newUser).reduce((obj, field) => {
                if (!notReturnedFields.includes(field)) {
                    obj[field] = newUser[field];
                }
                return obj;
            }, {});
            result.statusCode = 201;
        } catch (error) {
            if (error.message == "Phone number has been used") {
                result.statusCode = 400;
                result.response.message = "Phone number has been used";
            } else {
                console.error(error);
            }
        }
        return res.status(result.statusCode).json(result.response);
    };
    static login = async (req, res) => {
        let result = {
            statusCode: 400,
            response: { message: "Unexpected error. Contact dev" },
        };
        try {
            let account = await userServices.validateLogin(req.body);
            if (account) {
                result.statusCode = 200;
                result.response = account;
            } else {
                result.statusCode = 404;
                result.response.message =
                    "Account not exists or password is wrong";
            }
        } catch (error) {
            console.error(error);
        }
        return res.status(result.statusCode).json(result.response);
    };

    static logout = async (req, res) => {
        res.status(200).json({ message: "Loging out" });
    };

    static deleteUser = async (req, res) => {
        try {
            await userServices.delete({ id: req.params.id });
        } catch (error) {
            res.status(400).json({ error: { message: error.message } });
        }
        res.status(200).json({ message: "delete user" });
    };
    static getAllUser = async (req, res) => {
        let data = null;
        try {
            data = await userServices.getAll();
        } catch (error) {
            res.status(400).json({ error: { message: error.message } });
        }
        if (!data) {
            res.status(400).json({ error: { message: "Unexpected error" } });
        }
        res.status(200).json(data);
    };
}
// Export
module.exports = userController;
