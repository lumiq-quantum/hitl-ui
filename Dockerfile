# Dockerfile for Next.js project (multi-stage build)

# ---- Dependencies Stage ----
FROM node:24-slim
WORKDIR /app
# Install dependencies based on package.json and lockfile
COPY package.json package-lock.json* ./
RUN npm ci


# Copy all source files and build
COPY . ./
RUN npm run build

WORKDIR /app
ENV NODE_ENV=production



# Expose default Next.js port
EXPOSE 3000
# Start in production mode
CMD ["npm", "start"]
