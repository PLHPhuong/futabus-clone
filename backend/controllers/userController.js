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
        const body = req.body;
        let newUser = null;
        try {
            newUser = await userServices.create(body);
        } catch (error) {
            res.status(400).json({ error: { message: error.message } });
        }
        if (!newUser) {
            res.status(400).json({ error: { message: "Unexpected error" } });
        }
        const notReturnedFields = ["password"];
        const result = Object.keys(newUser._doc).reduce((obj, field) => {
            if (!notReturnedFields.includes(field)) {
                obj[field] = newUser[field];
            }
            return obj;
        }, {});
        res.status(201).json(result);
    };
    static login = async (req, res) => {
        res.status(200).json({ message: "Loging in" });
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
