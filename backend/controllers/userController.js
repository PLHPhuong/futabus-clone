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
        // Get variables
        const body = req.body;
        // Check create a new user (check exstence too) then return if error happended
        let newUser = null;
        try {
            newUser = await userServices.create(body);
        } catch (error) {
            return res.status(400).json({ error: { message: error.message } });
        }
        if (!newUser) {
            return res
                .status(400)
                .json({ error: { message: "Unexpected error" } });
        }
        // Filtered what info will return
        const notReturnedFields = ["password"];

        const result = Object.keys(newUser).reduce((obj, field) => {
            if (!notReturnedFields.includes(field)) {
                obj[field] = newUser[field];
            }
            return obj;
        }, {});
        // result
        return res.status(201).json(result);
    };
    static login = async (req, res) => {
        let result = {
            statusCode: 400,
            response: { message: "Unexpected error" },
        };

        let account = null;

        try {
            account = await userServices.searchLoginInfo(
                req.body.phone,
                req.body.password
            );

            if (account === null) {
                result.statusCode = 404;
                result.response.message =
                    "Account not found or password is wrong";
            } else {
                result.statusCode = 200;
                const notReturnedFields = ["password"];

                result.response = Object.keys(account._doc).reduce(
                    (obj, field) => {
                        if (!notReturnedFields.includes(field)) {
                            obj[field] = account[field];
                        }
                        return obj;
                    },
                    {}
                );
            }
        } catch (err) {
            result.response.message += `\nerror: ${err}`;
            console.log(result.response.message);
        }

        return res.status(result.statusCode).json(result.response);
    };
    static logout = async (req, res) => {
        res.status(200).json({ message: "Loging out" });
    };
    static deleteUser = async (req, res) => {
        try {
            await userServices.delete(req.params.id);
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
