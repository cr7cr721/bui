# Use official Node.js image (latest LTS)
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start development server
CMD ["yarn", "dev", "--host"]