# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose the port (default 2801, can be overridden by .env)
EXPOSE 2801

# Start the application
CMD ["npm", "start"]
