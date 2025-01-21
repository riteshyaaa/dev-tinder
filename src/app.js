const express = require("express");
const connectDB = require("./config/database.js");
const app = express();

connectDB()
  .then(() => {
    console.log("Mongoose is connected successfully ")
    app.listen(3000, () => {
      console.log("Server is successfully listing at port 3000");
    });
  })
  .catch((err) => console.error("Mongoose is not connected" + err));
