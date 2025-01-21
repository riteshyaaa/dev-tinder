const express = require("express");
const app = express();




//Dynamic routing 
app.get("/user", (req, res) => {
  const userId = req.query;
  console.log(userId);
  res.send({ firstName: "Ritesh", lastName: "yadav" });
});

app.post("/user", (req, res) => {
  res.send("Successfully data seved to database");
});

app.delete("/user", (req, res) => {
  res.send("Deleted successfully");
});

// This will match all the HTTP method api which start with /user 
app.use("/user", (req, res) => {
  res.send("User data")
})

app.listen(3000, () => {
  console.log("Server is successfully listing at port 3000");
});
