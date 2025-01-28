var validator = require("validator");

const validateSignUpdata = (req) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error("First Name and Last Name are required");
  } else if (!validator.isEmail(email)) {
    throw new Error("invalid email");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("password is not strong ");
  }
};
const validateEditProfileData = (req) => {
  const allowedProfileField = [
    "firstName",
    "lastName",
    "email",
    "age",
    "gender",
    "about",
    "photoUrl",
  ];

  const isEditAllowed = Object.keys(req.body).every((field) => allowedProfileField.includes(field)
  );
 
  return isEditAllowed;
};
module.exports = { validateSignUpdata, validateEditProfileData };
