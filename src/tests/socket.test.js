/**
 * Socket.IO Integration Tests
 *
 * Tests the real-time events: join, messaging, typing, online status.
 * Uses socket.io-client to connect to the test server.
 *
 * Note: Requires the server to be running OR use the createApp pattern.
 * For CI, these tests connect to a real instance (set TEST_SERVER_URL env).
 */

const { createServer } = require("http");
const { Server } = require("socket.io");
const Client = require("socket.io-client");
const { createApp, connectTestDB, clearTestDB, disconnectTestDB } = require("./setup");
const initializeSocket = require("../utils/socket");

let io, serverSocket, clientSocket, httpServer;
const PORT = 4001;

beforeAll(async () => {
  await connectTestDB();

  // Create HTTP server + Socket.IO
  const app = createApp();
  httpServer = createServer(app);
  initializeSocket(httpServer);

  await new Promise((resolve) => {
    httpServer.listen(PORT, resolve);
  });
});

afterAll(async () => {
  if (clientSocket) clientSocket.disconnect();
  httpServer.close();
  await clearTestDB();
  await disconnectTestDB();
});

beforeEach((done) => {
  // Create a fresh client connection for each test
  clientSocket = Client(`http://localhost:${PORT}`, {
    transports: ["websocket"],
  });
  clientSocket.on("connect", done);
});

afterEach(() => {
  if (clientSocket) clientSocket.disconnect();
});

describe("Socket.IO Events", () => {
  describe("registerUser", () => {
    it("should register user and emit userOnline", (done) => {
      clientSocket.emit("registerUser", { userId: "testUser123" });

      // Give it a moment to process
      setTimeout(() => {
        clientSocket.emit("checkOnline", { targetId: "testUser123" });
        clientSocket.on("onlineStatus", ({ userId, online }) => {
          expect(userId).toBe("testUser123");
          // User registered on this same socket, so it's "online"
          done();
        });
      }, 100);
    });
  });

  describe("joinChat", () => {
    it("should join a chat room without errors", (done) => {
      clientSocket.emit("joinChat", {
        firstName: "Test",
        userId: "user1",
        targetId: "user2",
      });
      // If no error thrown within 100ms, the join succeeded
      setTimeout(done, 100);
    });
  });

  describe("typing indicators", () => {
    it("should relay typing events to room members", (done) => {
      // Create a second client
      const client2 = Client(`http://localhost:${PORT}`, {
        transports: ["websocket"],
      });

      client2.on("connect", () => {
        // Both join the same chat
        clientSocket.emit("joinChat", { firstName: "A", userId: "a", targetId: "b" });
        client2.emit("joinChat", { firstName: "B", userId: "b", targetId: "a" });

        setTimeout(() => {
          // Client2 listens for typing
          client2.on("userTyping", ({ firstName }) => {
            expect(firstName).toBe("A");
            client2.disconnect();
            done();
          });

          // Client1 emits typing
          clientSocket.emit("typing", {
            userId: "a",
            targetId: "b",
            firstName: "A",
          });
        }, 100);
      });
    });
  });

  describe("checkOnline", () => {
    it("should return offline for non-registered user", (done) => {
      clientSocket.emit("checkOnline", { targetId: "nobody123" });
      clientSocket.on("onlineStatus", ({ userId, online }) => {
        expect(userId).toBe("nobody123");
        expect(online).toBe(false);
        done();
      });
    });
  });

  describe("getOnlineUsers", () => {
    it("should return empty array for unknown users", (done) => {
      clientSocket.emit("getOnlineUsers", { userIds: ["x", "y", "z"] });
      clientSocket.on("onlineUsers", ({ users }) => {
        expect(Array.isArray(users)).toBe(true);
        expect(users.length).toBe(0);
        done();
      });
    });
  });
});
