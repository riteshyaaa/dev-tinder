const express = require("express");
const connectDB = require("./config/database.js");
const app = express();
 const User = require("./models/user.js");

app.post("/signup", async (req,res) => {


// we have to create a instance of User schema 

const user = new User({
  firstName:"Raj",
  lastname: "patel",
  email:"riteshyaa",
  password: "OmSingh123",
});

try{
  await user.save()
  res.send("user is added successfully!")

} catch(err){
  res.status(400).send("Error saving data:"+err.message);

}
})


connectDB()
  .then(() => {
    console.log("Mongoose is connected successfully ")
    app.listen(3000, () => {
      console.log("Server is successfully listing at port 3000");
    });
  })
  .catch((err) => console.error("Mongoose is not connected" + err));
