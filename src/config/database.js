const mongoose = require("mongoose")
require('dotenv').config()


const connectDB = async() => {
await mongoose.connect("mongodb+srv://"+process.env.MONGO_DB_USERNAME+":"+process.env.MONGO_DB_PASSWORD+"@cluster0.idc8p5l.mongodb.net/devtinder"

)
}

  module.exports = connectDB; 

