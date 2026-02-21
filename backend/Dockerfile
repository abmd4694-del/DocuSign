# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install production deps only
COPY package*.json ./
RUN npm ci --omit=dev

# ---- Runtime Stage ----
FROM node:20-alpine

WORKDIR /app

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy installed deps from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application source
COPY . .

# Create the uploads directory (owned by appuser)
RUN mkdir -p uploads && chown -R appuser:appgroup /app

USER appuser

# Render sets PORT automatically; expose it here for documentation
EXPOSE 5000

# Health-check so Render knows the container is ready
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-5000}/api/health || exit 1

CMD ["node", "server.js"]
