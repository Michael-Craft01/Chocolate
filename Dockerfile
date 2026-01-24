# Use the official Playwright image (it has all the browser dependencies)
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy your source code
COPY . .

# Run the cron job
CMD [ "npx", "ts-node", "src/index.ts" ]