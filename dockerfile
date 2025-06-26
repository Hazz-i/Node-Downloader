# Use official Node.js runtime as base image
FROM node:18-alpine

# ✅ Tambahkan Python & dependensi build
RUN apk add --no-cache python3 py3-pip make g++

# Set working directory in container
WORKDIR /app

# Copy package.json dan lock file
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy source code
COPY . .

# Buat user non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Ganti owner
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3005

# Set environment
ENV NODE_ENV=production

# Jalankan aplikasi
CMD ["npm", "start"]
