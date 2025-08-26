FROM node:lts-alpine

WORKDIR /usr/src/app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose the port that Vite will run on
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev"]