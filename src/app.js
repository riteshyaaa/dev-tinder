const express = require("express");
const connectDB = require("./config/database.js");
const app = express();
 const User = require("./models/user.js");

 app.use(express.json());

app.post("/signup", async (req,res) => {


// we have to create a instance of User schema 

const user = new User(req.body);

try{
  await user.save()
  res.send("user is added successfully!")

} catch(err){
  res.status(400).send("Error saving data:"+err.message);

}
})

//Get One user from the database by their email address 
//app.get is for to get the user from database 
app.get("/user", async (req, res) => {
 const userEmail= req.body.email;
  try {
    const user = await User.findOne({email:userEmail})
  if(!userEmail)return res.status(404).send("User does not exist");
  res.send(user);
  }catch(err){
    res.status(400).send("Server error: " + err.message)
  }
})

//Feed api for getting users from the database 

app.get("/feed", async (req,res) => {
  try{
    const users = await User.find({})
    if(!users)return res.status(404).send("No user exist");
    res.send(users);

  }catch(err){
    res.status(400).send("Server error: " +err.message)
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
