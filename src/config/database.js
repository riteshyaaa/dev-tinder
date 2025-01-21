const mongoose = require("mongoose")

const connectDB = async() => {
await mongoose.connect("mongodb+srv://riteshyaaa:G38N792Z6CB6WgZP@cluster0.vrmb3.mongodb.net/devTinder"

)
}

  module.exports = connectDB;





