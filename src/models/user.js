const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      minLength: 2,
      maxLength: 20,
      trim: true,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email address" + value);
        }
      },
    },
    password: {
      type: String,
      required: true,

      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Use a strong password");
        }
      },
      // match:/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/
    },

    age: {
      type: Number,
      min: 18,
      max: 50,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      lowercase: true,
      // enum:["male", "female", "other"]
      //custom validation
      validate(value) {
        if (!["male", "female", "Other"].includes(value)) {
          throw new Error("Invalid value for gender" + value);
        }
      },
    },
    photoUrl: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid Url address" + value);
        }
      },
    },
    about: {
      type: String,
      default: "This is the default about of the user ",
    },
    skills: {
      type: [String],
      default: "react ...",
    },
  },
  { timestamps: true }
);

UserSchema.methods.getJWT = async function () {

  const user = this;
  const token = jwt.sign({ _id: user._id }, "Riteshy@dav89", {
    expiresIn: "7D",
  }
 
);

  return token;
};

UserSchema.methods.validatePassword= async function(passwordInputByUser){
  const user = this;
  const passwordHash = user.password 
  const isPasswordValid = await bcrypt.compare(passwordInputByUser,passwordHash);
  return isPasswordValid;
} 

// // Export the model so it can be used elsewhere in your application.
module.exports = mongoose.model("User", UserSchema);
