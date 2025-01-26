const express = require("express");
const connectDB = require("./config/database.js");
const app = express();
const cookieParser = require("cookie-parser");


app.use(express.json());
app.use(cookieParser());
const authRouter = require("./routes/auth.js");
const profileRouter = require("./routes/profile.js");
const requestRouter = require("./routes/request.js");
app.use("/", authRouter)
app.use("/", profileRouter)
app.use("/", requestRouter)


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
