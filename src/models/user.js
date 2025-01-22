
const mongoose = require("mongoose")
 
const UserSchema = new mongoose.Schema({
    firstName: {
        type:String,
    },
    lastName:{
        type:String,
    },
    email:{
        type:String,
    },
   
    password:{
        type:String,
    },

    age:{
        type:Number,
    },
    gender:{
        type:String,
    }
});
 

// // Export the model so it can be used elsewhere in your application.
module.exports = mongoose.model("User", UserSchema);


