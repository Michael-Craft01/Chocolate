# --- STAGE 1: BUILD ---
FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y openssl

# Copy manifests
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Generate Prisma Client & Build TypeScript
RUN npx prisma generate
RUN npm run build

# --- STAGE 2: RUNTIME ---
# Use the official Playwright image which includes all browser dependencies
FROM mcr.microsoft.com/playwright:v1.43.0-jammy

WORKDIR /app

# Copy built artifacts and necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Expose Mission Control Port
EXPOSE 3005

# Set Environment to Production
ENV NODE_ENV=production

# Start the Engine
CMD ["node", "dist/index.js"]