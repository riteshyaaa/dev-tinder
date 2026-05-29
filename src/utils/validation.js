const validator = require("validator");

const validateSignUpdata = (req) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error("First Name and Last Name are required");
  } else if (!validator.isEmail(email)) {
    throw new Error("Invalid email");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong enough. Use at least 8 characters with uppercase, lowercase, number, and symbol.");
  }
};

const validateEditProfileData = (req) => {
  const allowedProfileFields = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "about",
    "photoUrl",
    "skills",
    "experienceLevel",
    "location",
    "currentlyBuilding",
    "availability",
    "lookingFor",
    "socialLinks",
    "github",
    "portfolio",
  ];

  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedProfileFields.includes(field)
  );

  return isEditAllowed;
};

module.exports = { validateSignUpdata, validateEditProfileData };
