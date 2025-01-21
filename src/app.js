const express = require("express");
const app = express();



//Regex routing
app.get(/.*fly$/, (req, res) => {
   
  // console.log(req.query);
  res.send({ firstName: "Ritesh", lastName: "yadav" });
});


app.listen(3000, () => {
  console.log("Server is successfully listing at port 3000");
});
