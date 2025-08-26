FROM node:lts-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Expose port
EXPOSE 3000

# Use your serve script (vite preview)
CMD ["npm", "run", "serve", "--", "--host", "0.0.0.0", "--port", "3000"]