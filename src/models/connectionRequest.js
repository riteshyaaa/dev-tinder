const mongoose = require("mongoose");


const connectionRequestSchema = new mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ["interested","ignore", "accepted", "rejected"],
      message: "{VALUE} is not a valid status",
    },
  },
},{
    timestamps:true,
});


connectionRequestSchema.index({fromUserId: 1, toUserId: 1})

// Pre-save middleware to prevent duplicate connection requests with same user
//pre('save') Middleware: Runs before saving a new connection request.
 connectionRequestSchema.pre("save", async function(next){
  const connectionRequest = this;
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    const error = new Error('fromUserId and toUserId cannot be the same.');
    return next(error);
  }

next()
})



module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema);
