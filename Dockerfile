# Use the official Playwright image with matching version
FROM mcr.microsoft.com/playwright:v1.50.0-noble

# Create app directory
WORKDIR /usr/src/app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy Prisma schema and generate client
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npx prisma generate

# Copy source code
COPY src ./src/
COPY tsconfig.json ./

# Create data directory for SQLite
RUN mkdir -p data

# Run the lead engine
CMD ["npx", "ts-node", "--esm", "src/index.ts"]