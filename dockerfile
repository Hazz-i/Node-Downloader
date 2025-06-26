# Use official Node.js runtime
FROM node:18-alpine

# Add dependencies for node-canvas and other native builds
RUN apk add --no-cache \
    python3 \
    py3-pip \
    make \
    g++ \
    pkgconfig \
    pixman \
    cairo-dev \
    pango-dev \
    giflib-dev \
    jpeg-dev \
    libpng-dev \
    musl-dev

# Set working directory
WORKDIR /app

# Copy only package info first
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy the rest of the app
COPY . .

# Create and use non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3005

# Set environment
ENV NODE_ENV=production

# Run app
CMD ["npm", "start"]
