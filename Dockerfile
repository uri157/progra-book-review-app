# Multi-stage build for Next.js app
FROM node:20-alpine AS builder
WORKDIR /app

# Build arguments
ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source
COPY . .

# Build the application and prune dev dependencies
RUN npm run build && npm prune --omit=dev

# Production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy built artifacts and production dependencies
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
