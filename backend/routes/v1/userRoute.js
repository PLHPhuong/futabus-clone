const express = require("express");
const router = express.Router();

const userController = require("../../controllers/userController");
const userMiddleware = require("../../middlewares/userMiddleware");

router.get("/test", (req, res) => {
    console.log("Successfully pin to user route");
    res.status(200).send({ message: "Successfully pin to user route" });
});

router.post(
    "/",
    userMiddleware.addRoleField,
    userController.validateMiddleware,
    userController.register
);

router.get("/", userController.getAllUser);
router.post("/login", userController.login);
router.delete("/:id", userController.deleteUser);

module.exports = router;
