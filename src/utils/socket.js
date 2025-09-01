const { Server } = require("socket.io");
const crypto = require("crypto");

const getSecretRoomId = (userId, targetId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetId].sort().join("$"))
    .digest("hex");
};
const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  io.on("connection", (socket) => {
    socket.on("joinChat", ({firstName, userId, targetId}) => {
      const roomId = getSecretRoomId(userId, targetId);
      console.log(`${firstName} joined room: ${roomId}`);
      socket.join(roomId);
    });
    socket.on(
      "sendMessage",
      ({ firstName, lastName, userId, targetId, text }) => {
        const roomId = getSecretRoomId(userId, targetId);
        console.log(`Message from ${firstName} to room ${roomId}: ${text}`);
        io.to(roomId).emit("messageReceived", { firstName, lastName, text });
      }
    );
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    })
  });
};

module.exports = initializeSocket;
