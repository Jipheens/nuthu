# Backend Node.js Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy production environment file
COPY .env.production .env

# Copy source code
COPY src ./src

# Copy uploads folder with images
COPY uploads ./uploads

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 4000

# Set environment
ENV NODE_ENV=production

# Start the server
CMD ["node", "src/server.js"]
