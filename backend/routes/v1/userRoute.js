const express = require("express");
const router = express.Router();

const userController = require("../../controllers/userController");
const userMiddleware = require("../../middlewares/userMiddleware");

const { body, validationResult } = require("express-validator");

// grobal variables
// > validator
const fieldValidator = {
    phone: body("phone")
        .isNumeric()
        .withMessage(`"Phone" field must be a numberic string`),
    password: body("password")
        .isString()
        .withMessage(`"password" field must be a string`),
    email: body("email")
        .isEmail()
        .withMessage(`"email" field has email format`),
    username: body("username")
        .isString()
        .withMessage(`"username" field must be a string`),
    role: body("role").equals("admin").equals("customer"),

    existsValidator: (fieldName) => {
        return body(fieldName)
            .exists()
            .withMessage(`"${fieldName}" is required`);
    },
    errorHandler: (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
};

const validateMiddleware = {
    register: [
        fieldValidator.phone.exists().withMessage(`"phone" is required`),
        fieldValidator.password.exists().withMessage(`"password" is required`),
        fieldValidator.errorHandler,
    ],
    login: [
        fieldValidator.phone.exists().withMessage(`"phone" is required`),
        fieldValidator.password.exists().withMessage(`"password" is required`),
        fieldValidator.errorHandler,
    ],
};
// > routes
router.get("/test", (req, res) => {
    console.log("Successfully pin to user route");
    res.status(200).send({ message: "Successfully pin to user route" });
});
router.post(
    "/",
    userMiddleware.addRoleField,
    validateMiddleware.register,
    userController.register
);
router.post("/login", validateMiddleware.login, userController.login);

// router.post(
//     "/",
//     userMiddleware.addRoleField,
//     userController.validateMiddleware,
//     userController.register
// );

router.get("/", userController.getAllUser);
// router.post("/login", userController.login);
router.delete("/:id", userController.deleteUser);

module.exports = router;
