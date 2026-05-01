# --- STAGE 1: DEPENDENCIES ---
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# --- STAGE 2: BUILDER ---
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
# Note: NEXT_PUBLIC_ variables must be available at build time
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:3005
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

RUN npm run build

# --- STAGE 3: RUNNER ---
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
