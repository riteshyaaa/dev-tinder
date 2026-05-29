/**
 * DevTinder Database Seeder
 *
 * Creates realistic sample data for development/demo purposes.
 * Run with: npm run seed
 *
 * Creates:
 * - 50 sample users (varied skills, profiles, photos)
 * - 25 connection requests (interested/accepted/ignored mix)
 * - 3 active challenges + 1 past
 * - 5 sample projects
 * - 10 activity stories
 * - 30 messages between connected users
 */

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
const Message = require("../models/message");
const Challenge = require("../models/challenge");
const Project = require("../models/project");
const Activity = require("../models/activity");

// ===== SAMPLE DATA =====

const FIRST_NAMES = [
  "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Quinn", "Avery",
  "Skyler", "Dakota", "Reese", "Charlie", "Finley", "Rowan", "Sage",
  "Harper", "Blake", "Drew", "Jamie", "Kai", "Logan", "Parker", "River",
  "Hayden", "Cameron", "Emerson", "Phoenix", "Remy", "Arden", "Ellis",
  "Priya", "Arjun", "Yuki", "Marco", "Elena", "Omar", "Zara", "Leo",
  "Mina", "Soren", "Lena", "Nico", "Aisha", "Ravi", "Isla", "Felix",
  "Luna", "Theo", "Maya", "Jasper",
];

const LAST_NAMES = [
  "Chen", "Patel", "Kim", "Johnson", "Singh", "Williams", "Nakamura",
  "Garcia", "Mueller", "Tanaka", "Anderson", "Kumar", "Lee", "Martinez",
  "Thompson", "Sato", "Rodriguez", "Brown", "Ali", "Johansson",
  "Walker", "Nguyen", "Clark", "Torres", "Wright", "Lopez", "Hill",
  "Adams", "Scott", "Green", "Baker", "Nelson", "Carter", "Mitchell",
  "Roberts", "Turner", "Phillips", "Campbell", "Parker", "Evans",
  "Edwards", "Collins", "Stewart", "Morris", "Murphy", "Rivera",
  "Cooper", "Reed", "Ward", "Hayes",
];

const SKILLS_POOL = [
  "JavaScript", "TypeScript", "React", "Angular", "Vue", "Svelte",
  "Node.js", "Express", "Python", "Django", "Flask", "FastAPI",
  "Java", "Spring Boot", "Go", "Rust", "C++", "C#", ".NET",
  "Ruby", "Rails", "PHP", "Laravel", "Swift", "Kotlin",
  "Docker", "Kubernetes", "AWS", "Azure", "GCP",
  "MongoDB", "PostgreSQL", "MySQL", "Redis", "Firebase",
  "GraphQL", "REST API", "Next.js", "Tailwind CSS", "Git",
  "Machine Learning", "TensorFlow", "React Native", "Flutter",
];

const ABOUT_TEMPLATES = [
  "Full-stack developer passionate about {skill1} and {skill2}. Building cool things every day.",
  "Backend engineer at heart. Love working with {skill1}, {skill2}, and distributed systems.",
  "Frontend developer obsessed with pixel-perfect UI. Currently exploring {skill1}.",
  "DevOps engineer automating everything with {skill1} and {skill2}. Cloud native enthusiast.",
  "Mobile developer building apps with {skill1}. Previously worked with {skill2} at a startup.",
  "Open source contributor. Maintain several {skill1} libraries. Looking for collaborators.",
  "Self-taught developer. Spent 2 years mastering {skill1} and {skill2}. Now freelancing.",
  "CS grad from MIT. Interested in {skill1}, system design, and {skill2}.",
  "10+ years building web apps. Expert in {skill1}. Currently learning {skill2}.",
  "Startup founder turned developer. Building with {skill1} and {skill2}.",
];

const BUILDING_TEMPLATES = [
  "A real-time collaboration tool for remote teams",
  "An AI-powered code review assistant",
  "A social platform for developer portfolios",
  "A Kubernetes deployment dashboard",
  "An open-source alternative to Notion",
  "A CLI tool for database migrations",
  "A VS Code extension for pair programming",
  "A serverless API gateway framework",
  "A mobile app for tracking coding habits",
  "A browser extension for GitHub analytics",
];

const PHOTOS = [
  "https://randomuser.me/api/portraits/men/1.jpg",
  "https://randomuser.me/api/portraits/women/2.jpg",
  "https://randomuser.me/api/portraits/men/3.jpg",
  "https://randomuser.me/api/portraits/women/4.jpg",
  "https://randomuser.me/api/portraits/men/5.jpg",
  "https://randomuser.me/api/portraits/women/6.jpg",
  "https://randomuser.me/api/portraits/men/7.jpg",
  "https://randomuser.me/api/portraits/women/8.jpg",
  "https://randomuser.me/api/portraits/men/9.jpg",
  "https://randomuser.me/api/portraits/women/10.jpg",
  "https://randomuser.me/api/portraits/men/11.jpg",
  "https://randomuser.me/api/portraits/women/12.jpg",
  "https://randomuser.me/api/portraits/men/13.jpg",
  "https://randomuser.me/api/portraits/women/14.jpg",
  "https://randomuser.me/api/portraits/men/15.jpg",
  "https://randomuser.me/api/portraits/women/16.jpg",
  "https://randomuser.me/api/portraits/men/17.jpg",
  "https://randomuser.me/api/portraits/women/18.jpg",
  "https://randomuser.me/api/portraits/men/19.jpg",
  "https://randomuser.me/api/portraits/women/20.jpg",
  "https://randomuser.me/api/portraits/men/21.jpg",
  "https://randomuser.me/api/portraits/women/22.jpg",
  "https://randomuser.me/api/portraits/men/23.jpg",
  "https://randomuser.me/api/portraits/women/24.jpg",
  "https://randomuser.me/api/portraits/men/25.jpg",
  "https://randomuser.me/api/portraits/women/26.jpg",
  "https://randomuser.me/api/portraits/men/27.jpg",
  "https://randomuser.me/api/portraits/women/28.jpg",
  "https://randomuser.me/api/portraits/men/29.jpg",
  "https://randomuser.me/api/portraits/women/30.jpg",
  "https://randomuser.me/api/portraits/men/31.jpg",
  "https://randomuser.me/api/portraits/women/32.jpg",
  "https://randomuser.me/api/portraits/men/33.jpg",
  "https://randomuser.me/api/portraits/women/34.jpg",
  "https://randomuser.me/api/portraits/men/35.jpg",
  "https://randomuser.me/api/portraits/women/36.jpg",
  "https://randomuser.me/api/portraits/men/37.jpg",
  "https://randomuser.me/api/portraits/women/38.jpg",
  "https://randomuser.me/api/portraits/men/39.jpg",
  "https://randomuser.me/api/portraits/women/40.jpg",
  "https://randomuser.me/api/portraits/men/41.jpg",
  "https://randomuser.me/api/portraits/women/42.jpg",
  "https://randomuser.me/api/portraits/men/43.jpg",
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/45.jpg",
  "https://randomuser.me/api/portraits/women/46.jpg",
  "https://randomuser.me/api/portraits/men/47.jpg",
  "https://randomuser.me/api/portraits/women/48.jpg",
  "https://randomuser.me/api/portraits/men/49.jpg",
  "https://randomuser.me/api/portraits/women/50.jpg",
];

const EXPERIENCE_LEVELS = ["junior", "mid", "senior", "lead"];
const GENDERS = ["male", "female", "non-binary", "prefer not to say"];
const AVAILABILITIES = ["open", "busy", "weekends", "evenings"];
const LOOKING_FOR_OPTIONS = [
  "pair-programming", "co-founder", "mentor", "mentee",
  "hackathon-buddy", "open-source", "networking",
];
const LOCATIONS = [
  "San Francisco, CA", "New York, NY", "London, UK", "Berlin, Germany",
  "Bangalore, India", "Toronto, Canada", "Tokyo, Japan", "Remote",
  "Austin, TX", "Seattle, WA", "Sydney, Australia", "Singapore",
  "Amsterdam, Netherlands", "Paris, France", "Dubai, UAE",
];

// ===== HELPER FUNCTIONS =====

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ===== GENERATE USERS =====

const generateUsers = async () => {
  const users = [];
  const password = await bcrypt.hash("Test@1234", 10);

  for (let i = 0; i < 50; i++) {
    const skills = pickN(SKILLS_POOL, randInt(3, 10));
    const about = pick(ABOUT_TEMPLATES)
      .replace("{skill1}", skills[0] || "JavaScript")
      .replace("{skill2}", skills[1] || "Python");

    users.push({
      firstName: FIRST_NAMES[i],
      lastName: LAST_NAMES[i],
      email: `${FIRST_NAMES[i].toLowerCase()}.${LAST_NAMES[i].toLowerCase()}@devtinder.dev`,
      password,
      age: randInt(20, 45),
      gender: pick(GENDERS),
      photoUrl: PHOTOS[i],
      about,
      skills,
      experienceLevel: pick(EXPERIENCE_LEVELS),
      location: pick(LOCATIONS),
      currentlyBuilding: Math.random() > 0.3 ? pick(BUILDING_TEMPLATES) : "",
      availability: pick(AVAILABILITIES),
      lookingFor: pickN(LOOKING_FOR_OPTIONS, randInt(1, 3)),
      socialLinks: {
        linkedin: Math.random() > 0.4 ? `https://linkedin.com/in/${FIRST_NAMES[i].toLowerCase()}${LAST_NAMES[i].toLowerCase()}` : "",
        twitter: Math.random() > 0.5 ? `https://twitter.com/${FIRST_NAMES[i].toLowerCase()}_dev` : "",
        website: Math.random() > 0.6 ? `https://${FIRST_NAMES[i].toLowerCase()}.dev` : "",
      },
      github: Math.random() > 0.4 ? {
        username: `${FIRST_NAMES[i].toLowerCase()}${LAST_NAMES[i].toLowerCase()}`,
        avatarUrl: PHOTOS[i],
        bio: `${pick(EXPERIENCE_LEVELS)} developer | ${skills[0]} enthusiast`,
        profileUrl: `https://github.com/${FIRST_NAMES[i].toLowerCase()}${LAST_NAMES[i].toLowerCase()}`,
        publicRepos: randInt(5, 80),
        totalStars: randInt(0, 500),
        followers: randInt(5, 1000),
        following: randInt(10, 200),
        languages: Object.fromEntries(skills.slice(0, 4).map((s) => [s, randInt(1, 10)])),
        topRepos: [
          { name: `${skills[0].toLowerCase().replace(/[^a-z]/g, "")}-starter`, description: `A ${skills[0]} boilerplate`, stars: randInt(1, 50), language: skills[0], url: "#" },
          { name: "awesome-project", description: "My main open source project", stars: randInt(5, 200), language: skills[1] || skills[0], url: "#" },
        ],
      } : undefined,
      lastActive: new Date(Date.now() - randInt(0, 7) * 24 * 60 * 60 * 1000),
      challengeStreak: randInt(0, 10),
      profileViews: randInt(10, 200),
    });
  }

  return User.insertMany(users);
};

// ===== GENERATE CONNECTION REQUESTS =====

const generateConnections = async (users) => {
  const requests = [];
  const statuses = ["interested", "interested", "accepted", "accepted", "ignored"];

  for (let i = 0; i < 25; i++) {
    const fromIdx = randInt(0, 24);
    let toIdx = randInt(25, 49);

    // Avoid duplicates
    const exists = requests.find(
      (r) =>
        (r.fromUserId.toString() === users[fromIdx]._id.toString() && r.toUserId.toString() === users[toIdx]._id.toString()) ||
        (r.fromUserId.toString() === users[toIdx]._id.toString() && r.toUserId.toString() === users[fromIdx]._id.toString())
    );
    if (exists) continue;

    requests.push({
      fromUserId: users[fromIdx]._id,
      toUserId: users[toIdx]._id,
      status: pick(statuses),
    });
  }

  return ConnectionRequest.insertMany(requests);
};

// ===== GENERATE MESSAGES =====

const generateMessages = async (users, connections) => {
  const acceptedPairs = connections.filter((c) => c.status === "accepted");
  const messages = [];
  const sampleTexts = [
    "Hey! I saw your profile and loved your tech stack 🔥",
    "Hi there! Would you be interested in collaborating on a project?",
    "Nice to connect! What are you working on these days?",
    "Your GitHub repos look amazing! How did you learn Rust?",
    "Thanks for connecting! I'm looking for a pair programming buddy.",
    "Hey! I noticed we both know React. What's your favorite hook?",
    "Do you have experience with microservices architecture?",
    "Would love to chat about your experience with Kubernetes!",
    "I'm building something similar — let's sync up sometime!",
    "Great to meet you! Are you open to mentoring junior devs?",
    "```javascript\nconst hello = () => console.log('Hello World!');\nhello();\n```",
    "Check this out — what do you think about this approach?",
    "That's a great idea! Let me think about it and get back to you.",
    "Sure, I'd love to help! When are you free for a call?",
    "I just pushed a PR — mind taking a look?",
  ];

  for (const conn of acceptedPairs) {
    const numMessages = randInt(2, 6);
    for (let i = 0; i < numMessages; i++) {
      const isSenderFrom = Math.random() > 0.5;
      messages.push({
        senderId: isSenderFrom ? conn.fromUserId : conn.toUserId,
        receiverId: isSenderFrom ? conn.toUserId : conn.fromUserId,
        text: pick(sampleTexts),
        read: Math.random() > 0.3,
        createdAt: new Date(Date.now() - randInt(0, 48) * 60 * 60 * 1000),
      });
    }
  }

  if (messages.length > 0) {
    return Message.insertMany(messages);
  }
  return [];
};

// ===== GENERATE CHALLENGES =====

const generateChallenges = async () => {
  const challenges = [
    {
      title: "Build a Real-time Chat API",
      description: "Create a REST API with WebSocket support that handles message delivery, read receipts, and typing indicators. Use any backend framework.",
      difficulty: "medium",
      tags: ["Node.js", "WebSocket", "REST API", "Database"],
      timeLimit: "45 min",
      endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      isActive: true,
      submissions: [],
    },
    {
      title: "Implement a Rate Limiter Middleware",
      description: "Build an Express middleware that limits API requests to 100/minute/user using sliding window algorithm. Bonus: make it work with Redis.",
      difficulty: "hard",
      tags: ["Express", "Redis", "System Design", "Middleware"],
      timeLimit: "30 min",
      endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      isActive: true,
      submissions: [],
    },
    {
      title: "Create a Responsive Dashboard with Charts",
      description: "Build a dashboard page with at least 3 charts (line, bar, pie), a data table, and stat cards. Must be fully responsive on mobile.",
      difficulty: "easy",
      tags: ["React", "CSS", "Chart.js", "Responsive Design"],
      timeLimit: "60 min",
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      submissions: [],
    },
    {
      title: "Design a URL Shortener",
      description: "Implement a URL shortener service with custom aliases, expiration, and click analytics. Include API + simple frontend.",
      difficulty: "medium",
      tags: ["Full Stack", "Database", "API Design"],
      timeLimit: "45 min",
      endsAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      isActive: false,
      submissions: [],
    },
  ];

  return Challenge.insertMany(challenges);
};

// ===== GENERATE PROJECTS =====

const generateProjects = async (users) => {
  const projects = [
    {
      userId: users[0]._id,
      title: "Open Source Code Review Tool",
      description: "Building an AI-powered code review tool that integrates with GitHub PRs. Need a frontend dev who knows React and a ML engineer.",
      techStack: ["React", "Python", "FastAPI", "OpenAI"],
      lookingFor: "Frontend developer, ML Engineer",
      applicants: [users[5]._id, users[12]._id],
    },
    {
      userId: users[3]._id,
      title: "Developer Portfolio Platform",
      description: "A platform where devs can create beautiful portfolios from their GitHub data. Like Linktree but for developers.",
      techStack: ["Next.js", "Tailwind CSS", "PostgreSQL", "Vercel"],
      lookingFor: "UI/UX designer, Backend developer",
      applicants: [users[8]._id],
    },
    {
      userId: users[7]._id,
      title: "Real-time Pair Programming App",
      description: "WebRTC-based pair programming tool with shared editor, voice chat, and drawing board.",
      techStack: ["React", "WebRTC", "Node.js", "Socket.IO", "Monaco Editor"],
      lookingFor: "WebRTC expert, Full-stack developer",
      applicants: [users[1]._id, users[15]._id, users[22]._id],
    },
    {
      userId: users[10]._id,
      title: "CLI Tool for API Testing",
      description: "A fast, developer-friendly CLI alternative to Postman. Think 'curl but with superpowers'.",
      techStack: ["Go", "Terminal UI", "REST API"],
      lookingFor: "Go developer, Technical writer",
      applicants: [],
    },
    {
      userId: users[15]._id,
      title: "Hackathon Team Finder",
      description: "Match hackathon participants based on complementary skills. Like DevTinder but specifically for hackathons!",
      techStack: ["React Native", "Node.js", "MongoDB", "Socket.IO"],
      lookingFor: "Mobile developer, Backend developer",
      applicants: [users[2]._id, users[20]._id],
    },
  ];

  return Project.insertMany(projects);
};

// ===== GENERATE ACTIVITY STORIES =====

const generateActivities = async (users) => {
  const stories = [
    { userId: users[0]._id, content: "Just shipped v2.0 of my open source code review tool! 🚀 Added AI-powered suggestions using GPT-4. Check it out on GitHub!" },
    { userId: users[3]._id, content: "Day 30 of #100DaysOfCode — Finally understood how React Server Components work. Game changer for performance!" },
    { userId: users[5]._id, content: "Looking for beta testers for my new developer portfolio platform. DM me if interested! Built with Next.js + Tailwind." },
    { userId: users[7]._id, content: "TIL: You can use CSS container queries instead of media queries for component-level responsiveness. Mind = blown 🤯" },
    { userId: users[10]._id, content: "Deployed my first Go service to production today. The performance difference from Node.js is insane — 3ms avg response time!" },
    { userId: users[12]._id, content: "Hot take: TypeScript's type system is Turing complete and that's both amazing and terrifying 😂" },
    { userId: users[15]._id, content: "Just got my AWS Solutions Architect certification! 🎉 Happy to help anyone studying for it." },
    { userId: users[20]._id, content: "Building in public: Day 1 of my SaaS journey. Starting with the landing page and waitlist. Wish me luck! 🍀" },
    { userId: users[25]._id, content: "Pair programmed with someone from DevTinder today — we fixed a gnarly race condition in 20 minutes that I'd been stuck on for 2 days. This app is amazing!" },
    { userId: users[30]._id, content: "Rust's borrow checker finally clicked for me after 3 months. The 'aha' moment is real. Don't give up! 🦀" },
  ];

  return Activity.insertMany(stories);
};

// ===== MAIN SEED FUNCTION =====

const seed = async () => {
  try {
    // Connect to database
    const uri =
      process.env.MONGODB_URI ||
      `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.idc8p5l.mongodb.net/devtinder`;

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("✅ Connected!\n");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      ConnectionRequest.deleteMany({}),
      Message.deleteMany({}),
      Challenge.deleteMany({}),
      Project.deleteMany({}),
      Activity.deleteMany({}),
    ]);
    console.log("✅ Cleared!\n");

    // Generate data
    console.log("👤 Creating 50 users...");
    const users = await generateUsers();
    console.log(`✅ Created ${users.length} users\n`);

    console.log("🤝 Creating connection requests...");
    const connections = await generateConnections(users);
    console.log(`✅ Created ${connections.length} connections\n`);

    console.log("💬 Creating messages...");
    const messages = await generateMessages(users, connections);
    console.log(`✅ Created ${messages.length} messages\n`);

    console.log("⚡ Creating challenges...");
    const challenges = await generateChallenges();
    console.log(`✅ Created ${challenges.length} challenges\n`);

    console.log("🚀 Creating projects...");
    const projects = await generateProjects(users);
    console.log(`✅ Created ${projects.length} projects\n`);

    console.log("📝 Creating activity stories...");
    const activities = await generateActivities(users);
    console.log(`✅ Created ${activities.length} stories\n`);

    // Print test account info
    console.log("═══════════════════════════════════════════");
    console.log("🎉 Seeding complete! Test accounts:");
    console.log("═══════════════════════════════════════════");
    console.log(`\n  Email: alex.chen@devtinder.dev`);
    console.log(`  Password: Test@1234`);
    console.log(`\n  Email: jordan.patel@devtinder.dev`);
    console.log(`  Password: Test@1234`);
    console.log(`\n  (All 50 users use password: Test@1234)`);
    console.log(`  Email pattern: firstname.lastname@devtinder.dev\n`);
    console.log("═══════════════════════════════════════════\n");

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB. Done!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    console.error(err);
    process.exit(1);
  }
};

seed();
