const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    phone: {
        type: String,
        require: [true, "Missing phone field"],
        unique: true,
    },
    password: {
        type: String,
        require: [true, "Missing password field"],
    },
    username: {
        type: String,
        default: null,
    },
    email: {
        type: String,
        default: null,
    },
    role: {
        type: String,
        default: `customer`,
    },
});

module.exports = mongoose.model("User", UserSchema);
