const request = require("supertest");
const { createApp, connectTestDB, clearTestDB, disconnectTestDB } = require("./setup");

let app;

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
});

describe("Auth Endpoints", () => {
  const validUser = {
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    password: "Test@12345",
  };

  // ===== SIGNUP =====
  describe("POST /signUp", () => {
    it("should create a new user and return JWT cookie", async () => {
      const res = await request(app).post("/signUp").send(validUser);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.firstName).toBe("Test");
      expect(res.body.data.email).toBe("test@example.com");
      expect(res.body.data.password).toBeDefined(); // hashed
      expect(res.headers["set-cookie"]).toBeDefined();
      expect(res.headers["set-cookie"][0]).toContain("token=");
    });

    it("should reject duplicate email", async () => {
      await request(app).post("/signUp").send(validUser);
      const res = await request(app).post("/signUp").send(validUser);

      expect(res.status).toBe(400);
    });

    it("should reject weak password", async () => {
      const res = await request(app).post("/signUp").send({
        ...validUser,
        email: "weak@example.com",
        password: "123",
      });

      expect(res.status).toBe(400);
    });

    it("should reject invalid email", async () => {
      const res = await request(app).post("/signUp").send({
        ...validUser,
        email: "not-an-email",
      });

      expect(res.status).toBe(400);
    });

    it("should reject missing firstName", async () => {
      const res = await request(app).post("/signUp").send({
        ...validUser,
        firstName: "",
      });

      expect(res.status).toBe(400);
    });
  });

  // ===== LOGIN =====
  describe("POST /login", () => {
    beforeEach(async () => {
      await request(app).post("/signUp").send(validUser);
    });

    it("should login with valid credentials and return user + cookie", async () => {
      const res = await request(app).post("/login").send({
        email: validUser.email,
        password: validUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.firstName).toBe("Test");
      expect(res.body.email).toBe("test@example.com");
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("should reject invalid password", async () => {
      const res = await request(app).post("/login").send({
        email: validUser.email,
        password: "WrongPassword@1",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Invalid credentials");
    });

    it("should reject non-existent email", async () => {
      const res = await request(app).post("/login").send({
        email: "nobody@example.com",
        password: validUser.password,
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Invalid credentials");
    });
  });

  // ===== LOGOUT =====
  describe("POST /logout", () => {
    it("should clear the token cookie", async () => {
      const res = await request(app).post("/logout");

      expect(res.status).toBe(200);
      expect(res.headers["set-cookie"]).toBeDefined();
      // Cookie should be expired
      expect(res.headers["set-cookie"][0]).toContain("token=");
    });
  });

  // ===== PROTECTED ROUTES =====
  describe("Protected Routes (auth middleware)", () => {
    it("should return 401 for /profile/view without token", async () => {
      const res = await request(app).get("/profile/view");

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it("should return 401 for /feed without token", async () => {
      const res = await request(app).get("/feed");

      expect(res.status).toBe(401);
    });

    it("should access /profile/view with valid token", async () => {
      // Signup to get token
      const signupRes = await request(app).post("/signUp").send(validUser);
      const cookie = signupRes.headers["set-cookie"];

      const res = await request(app)
        .get("/profile/view")
        .set("Cookie", cookie);

      expect(res.status).toBe(200);
      expect(res.body.firstName).toBe("Test");
    });
  });
});
