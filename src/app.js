const express = require("express");
const connectDB = require("./config/database.js");
const app = express();
const cookieParser = require("cookie-parser");
var cors = require('cors')
const { createServer}=  require("http")
const { Server } = require("socket.io");
require('dotenv').config()


const corsOptions = {
  origin: 'http://localhost:5173', // Allow only this origin
  credentials: true, // Allow sending cookies and authorization headers
  methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());



const authRouter = require("./routes/auth.js");
const profileRouter = require("./routes/profile.js");
const requestRouter = require("./routes/request.js");
const userRouter = require("./routes/user.js");
const { init } = require("./models/user.js");
const initializeSocket = require("./utils/socket.js");


app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

const server = createServer(app);
initializeSocket(server);

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    console.log("Mongoose is connected successfully ");
    
    server.listen(PORT, () => {
      console.log("Server is successfully listing at port " + process.env.PORT);
    });
  })
  .catch((err) => console.error("Mongoose is not connected" + err));
