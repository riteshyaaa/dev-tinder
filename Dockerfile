# ===== DevTinder Backend Dockerfile =====
# Multi-stage build for optimized production image

FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Production dependencies only
FROM base AS production
RUN npm ci --only=production
COPY src/ ./src/

# Expose port (Railway/Render will override via PORT env)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the server
CMD ["node", "src/app.js"]
