const { Server } = require("socket.io");
const crypto = require("crypto");
const Message = require("../models/message");

const getSecretRoomId = (userId, targetId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetId].sort().join("$"))
    .digest("hex");
};

// Track online users: { odepUserId: socketId }
const onlineUsers = new Map();

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // ===== USER REGISTRATION (for notifications) =====
    socket.on("registerUser", ({ userId }) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;
        // Broadcast online status to all
        io.emit("userOnline", { userId });
      }
    });

    // ===== CHAT: JOIN ROOM =====
    socket.on("joinChat", ({ firstName, userId, targetId }) => {
      const roomId = getSecretRoomId(userId, targetId);
      socket.join(roomId);
      // Store userId on socket for cleanup
      socket.userId = userId;
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, socket.id);
      }
    });

    // ===== CHAT: SEND MESSAGE (with persistence) =====
    socket.on("sendMessage", async ({ firstName, lastName, userId, targetId, text, imageUrl, fileUrl, fileName }) => {
      try {
        const roomId = getSecretRoomId(userId, targetId);

        // Save message to database
        const message = new Message({
          senderId: userId,
          receiverId: targetId,
          text: text || "",
          imageUrl: imageUrl || null,
          fileUrl: fileUrl || null,
          fileName: fileName || null,
        });
        await message.save();

        // Emit to room
        io.to(roomId).emit("messageReceived", {
          firstName,
          lastName,
          text: text || "",
          senderId: userId,
          time: message.createdAt,
          imageUrl: imageUrl || null,
          fileUrl: fileUrl || null,
          fileName: fileName || null,
        });

        // Send notification to target if not in the same room
        const targetSocketId = onlineUsers.get(targetId);
        if (targetSocketId) {
          io.to(targetSocketId).emit("newMessageNotification", {
            fromUser: { _id: userId, firstName, lastName },
            text: (text || "").slice(0, 60),
          });
        }
      } catch (err) {
        console.error("Error saving message:", err.message);
      }
    });

    // ===== CHAT: TYPING INDICATORS =====
    socket.on("typing", ({ userId, targetId, firstName }) => {
      const roomId = getSecretRoomId(userId, targetId);
      socket.to(roomId).emit("userTyping", { firstName, userId });
    });

    socket.on("stopTyping", ({ userId, targetId }) => {
      const roomId = getSecretRoomId(userId, targetId);
      socket.to(roomId).emit("userStoppedTyping", { userId });
    });

    // ===== CHAT: READ RECEIPTS =====
    socket.on("messageRead", async ({ userId, targetId }) => {
      try {
        // Mark all messages from target to user as read
        await Message.updateMany(
          { senderId: targetId, receiverId: userId, read: false },
          { $set: { read: true } }
        );
        const roomId = getSecretRoomId(userId, targetId);
        socket.to(roomId).emit("messagesRead", { readBy: userId });
      } catch (err) {
        console.error("Error marking messages read:", err.message);
      }
    });

    // ===== CHAT: EMOJI REACTIONS =====
    socket.on("addReaction", async ({ messageId, emoji, userId, targetId }) => {
      try {
        const message = await Message.findById(messageId);
        if (message) {
          const reactions = message.reactions || {};
          const users = reactions[emoji] || [];
          if (users.includes(userId)) {
            // Remove reaction (toggle off)
            reactions[emoji] = users.filter((id) => id !== userId);
            if (reactions[emoji].length === 0) delete reactions[emoji];
          } else {
            // Add reaction
            reactions[emoji] = [...users, userId];
          }
          message.reactions = reactions;
          message.markModified("reactions");
          await message.save();

          const roomId = getSecretRoomId(userId, targetId);
          io.to(roomId).emit("reactionReceived", {
            messageId,
            emoji,
            fromUserId: userId,
            reactions: message.reactions,
          });
        }
      } catch (err) {
        console.error("Error adding reaction:", err.message);
      }
    });

    // ===== CHAT: LEAVE ROOM =====
    socket.on("leaveChat", ({ userId, targetId }) => {
      const roomId = getSecretRoomId(userId, targetId);
      socket.leave(roomId);
    });

    // ===== ONLINE STATUS =====
    socket.on("checkOnline", ({ targetId }) => {
      const isOnline = onlineUsers.has(targetId);
      socket.emit("onlineStatus", { userId: targetId, online: isOnline });
    });

    socket.on("getOnlineUsers", ({ userIds }) => {
      const online = (userIds || []).filter((id) => onlineUsers.has(id));
      socket.emit("onlineUsers", { users: online });
    });

    // ===== VIDEO CALL SIGNALING =====
    socket.on("startCall", ({ fromUserId, targetId, peerId }) => {
      const targetSocketId = onlineUsers.get(targetId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("incomingCall", { fromUserId, peerId });
      }
    });

    socket.on("endCall", ({ fromUserId, targetId }) => {
      const targetSocketId = onlineUsers.get(targetId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("callEnded", { fromUserId });
      }
    });

    // ===== DISCONNECT =====
    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit("userOffline", { userId: socket.userId });
      }
    });
  });

  return io;
};

module.exports = initializeSocket;
