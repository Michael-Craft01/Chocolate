# Use the official Playwright image with matching version
FROM mcr.microsoft.com/playwright:v1.50.0-noble

# Create app directory
WORKDIR /usr/src/app

# Install ALL dependencies (including dev for TypeScript compilation)
COPY package*.json ./
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npx prisma generate

# Copy source code and TypeScript config
COPY src ./src/
COPY tsconfig.json ./

# Compile TypeScript to JavaScript
RUN npx tsc

# Create data directory for SQLite
RUN mkdir -p data

# Run database migrations then start the app
CMD ["sh", "-c", "npx prisma db push && node --experimental-specifier-resolution=node dist/index.js"]