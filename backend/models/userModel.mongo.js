const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    
    phone: {
        type : String,
        require: [true,"Missing phone field"],
        unique: true,
    },
    password:{
        type : String,
        require: [true,"Missing password field"],
    },
    username:{
        type:String
    },
    email:{
        type:String
    },
    role:{
        type:String
    }
});

module.exports = mongoose.model('User',UserSchema)