# Multi-stage build for Next.js application
FROM node:22.18.0-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Accept build arguments for Next.js public environment variables
ARG NEXT_PUBLIC_API_URL=/api/v1
ARG NEXT_PUBLIC_APP_NAME="ISP Management System"
ARG NEXT_PUBLIC_APP_VERSION="1.0.0"

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_APP_VERSION=$NEXT_PUBLIC_APP_VERSION

# Build the application
RUN npm run build

# Production image
FROM node:22.18.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy the standalone server and its dependencies
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]


# Old docker file

# FROM node:22.18.0-alpine AS builder
# WORKDIR /app

# # Copy package files
# COPY package*.json ./
# RUN npm ci && npm cache clean --force

# # Copy source code
# COPY . .

# # Build the application
# RUN npm run build

# FROM node:22.18.0-alpine AS runner
# WORKDIR /app
# ENV NODE_ENV=production

# # Create a non-root user
# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nextjs

# # Copy built application
# COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# # Copy the standalone server and its dependencies
# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# # Copy static files
# COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# # Switch to non-root user
# USER nextjs

# EXPOSE 3000
# ENV PORT=3000
# ENV HOSTNAME="0.0.0.0"

# # Start the application
# CMD ["node", "server.js"]