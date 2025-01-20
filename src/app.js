// const express = require("express");
// const app = express();

// app.get("/", (req, res) => {
//   res.send("App is running on dashboard");
// });
// app.use("/hello", (req, res) => {
//   res.send("Hello from /hello");
// });
// app.use("/login", (req, res) => {
//     res.send("user login")
//     })

// app.listen(3000, () => {
//   console.log("Server is successfully listing at port 3000");
// });




const express = require('express');
const app = express();
const routes = require('./routes');

app.use("/", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


require("./xyz");
const calculateSum = require("./sum");
const a = 10;
const b = 20;
const y = 25;
console.log(y);

calculateSum(a, b);
