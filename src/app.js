const express = require("express");
const connectDB = require("./config/database.js");
const app = express();
const User = require("./models/user.js");
const { validateSignUpdata } = require("./utils/validation.js");
const bcrypt = require("bcrypt");
var validator = require("validator");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth.js");

app.use(express.json());
app.use(cookieParser());
//Register user
app.post("/signUp", async (req, res) => {
  try {
    //validate the user data
    validateSignUpdata(req);
    const { firstName, lastName, email, password, gender, age } = req.body;

    //Encrypt the password
    const encryptedPassword = await bcrypt.hash(password, 10);
    console.log(encryptedPassword);
    const user = new User({
      firstName,
      lastName,
      email,
      password: encryptedPassword,
      gender,
      age,
    });
    await user.save();
    res.send("User registered successfully:");
  } catch (error) {
    res.send("Error during signup:" + error.message);
  }
});

//Login user
app.post("/logIn", async (req, res) => {
  try {
    const { email, password } = req.body;
    //validating email address
    if (!validator.isEmail(email)) throw new Error("Invalid email address");
    //checking if user exist or not
    const user = await User.findOne({ email: email });
    if (!user) throw new Error("Invalid credentials");
    //varifying user password is correct or not
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      //create JWT token
      const token = jwt.sign({ _id: user._id }, "Riteshy@dav89", {expiresIn: '7d'});
      if (!token) {
        throw new Error("token not found");
      }

      // add token to cookie and send back to the user
      res.cookie("token", token,{ expires: new Date(Date.now() + 7*24*3600000)});

      res.send("login successfull");
    } else {
      res.send("Invalid credentials");
    }
  } catch (error) {
    res.status(400).send(" error during loging " + error.message);
  }
});
app.get("/profile", userAuth, async(req, res) => {
  try {
  const user = req.user;
  if(!user) throw new Error("user not found")

   console.log("user successfully logged in ")
   res.send(user)

  } catch (error) {
    res.status(400).send(" error during loging " + error.message);
  }
});

app.get("/sendConnectionRequest", userAuth, async(req,res) => {
  try {

    const user = req.user;
    const {firstName} = user;
    console.log("Request sent successfully ");

    res.send(firstName+ " made a connection reaquest")
    
  } catch (err) {
    res.status(400).send(" error during logging" +err.message);

    
  }
})

// //Get One user from the database by their email address
// //app.get is for to get the user from database
// app.get("/user", async (req, res) => {
//   const userEmail = req.body.email;
//   try {
//     const user = await User.findOne({ email: userEmail });
//     if (!userEmail) return res.status(404).send("User does not exist");
//     res.send(user);
//   } catch (err) {
//     res.status(400).send("Server error: " + err.message);
//   }
// });

// //Feed api for getting users from the database
// app.get("/feed", async (req, res) => {
//   try {
//     const users = await User.find({});
//     if (!users) return res.status(404).send("No user exist");
//     res.send(users);
//   } catch (err) {
//     res.status(400).send("Server error: " + err.message);
//   }
// });

// // delete users from the database
// app.delete("/user", async (req, res) => {
//   const userId = req.body.userId;
//   try {
//     const user = await User.findByIdAndDelete(userId);
//     res.send("User are deleted successfully");

//     res.status(404).send("Something went wrong");
//   } catch (err) {
//     res.status(400).send("Server error: " + err.message);
//   }
// });

// //find user by findById method
// app.patch("/user", async (req, res) => {
//   const userId = req.body.userId;
//   const data = req.body;

//   try {
//     const ALLOWED_USER = [
//       "userId",
//       "photoUrl",
//       "about",
//       "age",
//       "skills",
//       "gender",
//     ];
//     const isUpdateAllowed = Object.keys(data).every((k) =>
//       ALLOWED_USER.includes(k)
//     );
//     if (!isUpdateAllowed) {
//       throw new Error("User not allowed");
//     }
//     if (data.skills.length > 10) {
//       throw new Error("Skills should not be more than 10");
//     }
//     const user = await User.findByIdAndUpdate({ _id: userId }, data, {
//       returnDocument: "after",
//       runValidators: true,
//     });
//     // console.log(user);
//     res.send("User are updated successfully");
//   } catch (err) {
//     res.status(400).send("Server error: " + err.message);
//   }
// });

connectDB()
  .then(() => {
    console.log("Mongoose is connected successfully ");
    app.listen(3000, () => {
      console.log("Server is successfully listing at port 3000");
    });
  })
  .catch((err) => console.error("Mongoose is not connected" + err));
