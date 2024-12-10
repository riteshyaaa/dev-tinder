const express = require("express");

 const app = express();

app.use("/test", (req, res)=> {
    res.send("App started with nodemon")
})
app.listen(3000, () => {
    console.log("Server is successfully listing at port 3000")
});