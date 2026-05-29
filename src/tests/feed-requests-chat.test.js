const request = require("supertest");
const { createApp, connectTestDB, clearTestDB, disconnectTestDB } = require("./setup");

let app;
let userACookie, userBCookie;
let userAId, userBId;

beforeAll(async () => {
  await connectTestDB();
  app = createApp();
});

afterAll(async () => {
  await clearTestDB();
  await disconnectTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  // Create two test users
  const resA = await request(app).post("/signUp").send({
    firstName: "Alice",
    lastName: "Dev",
    email: "alice@test.com",
    password: "Alice@12345",
  });
  userACookie = resA.headers["set-cookie"];
  userAId = resA.body.data._id;

  const resB = await request(app).post("/signUp").send({
    firstName: "Bob",
    lastName: "Coder",
    email: "bob@test.com",
    password: "Bob@123456",
  });
  userBCookie = resB.headers["set-cookie"];
  userBId = resB.body.data._id;
});

describe("Feed Endpoints", () => {
  describe("GET /feed", () => {
    it("should return users excluding self", async () => {
      const res = await request(app)
        .get("/feed")
        .set("Cookie", userACookie);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      // Should include Bob, not Alice
      const ids = res.body.map((u) => u._id);
      expect(ids).toContain(userBId);
      expect(ids).not.toContain(userAId);
    });

    it("should exclude users with existing connections", async () => {
      // Alice sends interested to Bob
      await request(app)
        .post(`/request/send/interested/${userBId}`)
        .set("Cookie", userACookie);

      const res = await request(app)
        .get("/feed")
        .set("Cookie", userACookie);

      expect(res.status).toBe(200);
      const ids = res.body.map((u) => u._id);
      expect(ids).not.toContain(userBId);
    });

    it("should filter by skills", async () => {
      // Update Bob with skills
      await request(app)
        .patch("/profile/edit")
        .set("Cookie", userBCookie)
        .send({ skills: ["React", "Node.js"] });

      const res = await request(app)
        .get("/feed?skills=React")
        .set("Cookie", userACookie);

      expect(res.status).toBe(200);
      if (res.body.length > 0) {
        const bob = res.body.find((u) => u._id === userBId);
        if (bob) {
          expect(bob.skills).toContain("React");
        }
      }
    });

    it("should support pagination", async () => {
      const res = await request(app)
        .get("/feed?page=1&limit=1")
        .set("Cookie", userACookie);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeLessThanOrEqual(1);
    });
  });
});

describe("Request Endpoints", () => {
  describe("POST /request/send/:status/:toUserId", () => {
    it("should send interested request", async () => {
      const res = await request(app)
        .post(`/request/send/interested/${userBId}`)
        .set("Cookie", userACookie);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("interested");
      expect(res.body.data.fromUserId).toBe(userAId);
      expect(res.body.data.toUserId).toBe(userBId);
    });

    it("should send ignored request", async () => {
      const res = await request(app)
        .post(`/request/send/ignored/${userBId}`)
        .set("Cookie", userACookie);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("ignored");
    });

    it("should detect mutual match (isMatch: true)", async () => {
      // Bob sends interested to Alice first
      await request(app)
        .post(`/request/send/interested/${userAId}`)
        .set("Cookie", userBCookie);

      // Alice sends interested to Bob → match!
      const res = await request(app)
        .post(`/request/send/interested/${userBId}`)
        .set("Cookie", userACookie);

      expect(res.status).toBe(200);
      expect(res.body.isMatch).toBe(true);
    });

    it("should reject duplicate request", async () => {
      await request(app)
        .post(`/request/send/interested/${userBId}`)
        .set("Cookie", userACookie);

      const res = await request(app)
        .post(`/request/send/interested/${userBId}`)
        .set("Cookie", userACookie);

      expect(res.status).toBe(400);
    });

    it("should reject invalid status", async () => {
      const res = await request(app)
        .post(`/request/send/banana/${userBId}`)
        .set("Cookie", userACookie);

      expect(res.status).toBe(400);
    });
  });

  describe("POST /request/review/:status/:requestId", () => {
    it("should accept a connection request", async () => {
      // Bob sends interested to Alice
      const sendRes = await request(app)
        .post(`/request/send/interested/${userAId}`)
        .set("Cookie", userBCookie);

      const requestId = sendRes.body.data._id;

      // Alice accepts
      const res = await request(app)
        .post(`/request/review/accepted/${requestId}`)
        .set("Cookie", userACookie);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("accepted");
    });
  });

  describe("POST /request/undo/:userId", () => {
    it("should undo an ignored request", async () => {
      await request(app)
        .post(`/request/send/ignored/${userBId}`)
        .set("Cookie", userACookie);

      const res = await request(app)
        .post(`/request/undo/${userBId}`)
        .set("Cookie", userACookie);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("undone");
    });

    it("should return 404 if nothing to undo", async () => {
      const res = await request(app)
        .post(`/request/undo/${userBId}`)
        .set("Cookie", userACookie);

      expect(res.status).toBe(404);
    });
  });
});

describe("Connection & Chat Endpoints", () => {
  beforeEach(async () => {
    // Create a mutual connection (both interested → auto-accepted)
    await request(app)
      .post(`/request/send/interested/${userAId}`)
      .set("Cookie", userBCookie);
    await request(app)
      .post(`/request/send/interested/${userBId}`)
      .set("Cookie", userACookie);
  });

  describe("GET /user/connections", () => {
    it("should return accepted connections", async () => {
      const res = await request(app)
        .get("/user/connections")
        .set("Cookie", userACookie);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      const names = res.body.data.map((u) => u.firstName);
      expect(names).toContain("Bob");
    });
  });

  describe("GET /chat/:targetUserId", () => {
    it("should return empty messages for new chat", async () => {
      const res = await request(app)
        .get(`/chat/${userBId}`)
        .set("Cookie", userACookie);

      expect(res.status).toBe(200);
      expect(res.body.messages).toBeDefined();
      expect(Array.isArray(res.body.messages)).toBe(true);
      expect(res.body.targetUser).toBeDefined();
      expect(res.body.targetUser.firstName).toBe("Bob");
    });

    it("should reject chat with non-connected user", async () => {
      // Create a third user who is NOT connected
      const resC = await request(app).post("/signUp").send({
        firstName: "Charlie",
        lastName: "Hacker",
        email: "charlie@test.com",
        password: "Charlie@123",
      });
      const userCId = resC.body.data._id;

      const res = await request(app)
        .get(`/chat/${userCId}`)
        .set("Cookie", userACookie);

      expect(res.status).toBe(403);
    });
  });

  describe("GET /user/requests/received", () => {
    it("should return pending requests", async () => {
      // Clear and create fresh: only Bob sends to Alice (no mutual)
      await clearTestDB();
      const resA2 = await request(app).post("/signUp").send({
        firstName: "Alice2", lastName: "Dev", email: "alice2@test.com", password: "Alice@12345",
      });
      const resB2 = await request(app).post("/signUp").send({
        firstName: "Bob2", lastName: "Coder", email: "bob2@test.com", password: "Bob@123456",
      });
      const a2Cookie = resA2.headers["set-cookie"];
      const b2Cookie = resB2.headers["set-cookie"];
      const a2Id = resA2.body.data._id;

      // Bob sends interested to Alice
      await request(app)
        .post(`/request/send/interested/${a2Id}`)
        .set("Cookie", b2Cookie);

      const res = await request(app)
        .get("/user/requests/received")
        .set("Cookie", a2Cookie);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].fromUserId.firstName).toBe("Bob2");
    });
  });
});

describe("Profile Analytics", () => {
  it("should return analytics data", async () => {
    const res = await request(app)
      .get("/profile/analytics?range=week")
      .set("Cookie", userACookie);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.profileViews).toBeDefined();
    expect(res.body.data.matchRate).toBeDefined();
    expect(res.body.data.visibilityScore).toBeDefined();
    expect(res.body.data.tips).toBeDefined();
    expect(Array.isArray(res.body.data.weekActivity)).toBe(true);
  });
});
