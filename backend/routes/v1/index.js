const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    console.log(`Pin to router v1 successfully\n`);
    res.status(200).send(req.body);
});

router.use("/user", require("./userRoute"));

module.exports = router;
