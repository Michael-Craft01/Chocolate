# Build Stage
FROM node:20-bookworm-slim AS builder

WORKDIR /usr/src/app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl

# Set dummy DATABASE_URL for build step (Prisma validation)
ENV DATABASE_URL="file:./data/dev.db"

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npx prisma generate

COPY src ./src/
COPY tsconfig.json ./
RUN npx tsc

# Production Stage
FROM mcr.microsoft.com/playwright:v1.58.0-noble

WORKDIR /usr/src/app

# Copy package files for production install
COPY package*.json ./

# Copy Prisma schema (Required for db push)
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy verified artifacts from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma ./node_modules/@prisma

# Create data directory
RUN mkdir -p data

# Run database migrations then start the app
CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]