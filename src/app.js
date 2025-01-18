// const express = require("express");

//  const app = express();

// app.get("/test", (req, res)=> {
//     res.send("App started with nodemon")
// })
// app.listen(3000, () => {
//     console.log("Server is successfully listing at port 3000")
// });

 
require("./xyz")
const {x, calculateSum} =  require("./sum")
const a = 10;
const b = 20;
const y = 25;
console.log(y);

calculateSum(a,b);
console.log(x)
