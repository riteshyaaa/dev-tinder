# Contributing to DevTinder

Thank you for considering contributing! Here's how you can help.

## 🚀 Quick Start

```bash
git clone https://github.com/riteshyaaa/dev-tinder.git
cd dev-tinder
npm install
cp .env.example .env    # Fill in your MongoDB credentials
npm run seed            # Populate test data
npm run dev             # Start development server
```

## 📋 Development Workflow

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feat/your-feature` or `fix/bug-description`
3. **Make changes** and add tests
4. **Run tests**: `npm test`
5. **Commit** using conventional commits:
   - `feat: add new feature`
   - `fix: resolve bug`
   - `docs: update readme`
   - `test: add tests for X`
   - `refactor: restructure Y`
6. **Push** and open a Pull Request

## 🧪 Testing

- Write tests for new endpoints in `src/tests/`
- Ensure all existing tests pass before submitting
- For Socket.IO features, add tests in `socket.test.js`

## 📝 Code Style

- **async/await** over callbacks
- **try/catch** in all route handlers
- **JSON responses**: `{ data }`, `{ error }`, or `{ message }`
- **JSDoc comments** on service functions
- **Descriptive names** over abbreviations

## 🗂 Project Structure

| Directory | Purpose |
|-----------|---------|
| `src/routes/` | Express route handlers (one file per domain) |
| `src/models/` | Mongoose schemas |
| `src/middlewares/` | Auth, rate limiting |
| `src/services/` | Email, Cloudinary, cache, cron |
| `src/tests/` | Jest test files |
| `src/scripts/` | Seed script |

## 🐛 Reporting Bugs

Open an issue with:
- Steps to reproduce
- Expected vs actual behavior
- Node.js version and OS
- Error logs (if any)

## 💡 Feature Requests

Open an issue tagged `enhancement` with:
- Use case description
- Proposed API design (if applicable)
- Mockup (for frontend changes)
