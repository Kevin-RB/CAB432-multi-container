FROM node:lts-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Install serve globally for serving static files
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Serve the production build
CMD ["serve", "-s", "dist", "-l", "3000"]