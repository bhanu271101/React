# Base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the app
COPY . .

# Fix: make vite binary executable if installed locally (optional safety)
RUN chmod +x node_modules/.bin/vite

# Expose port (Vite uses 5173 by default)
EXPOSE 5173

# Start the Vite development server
CMD ["npm", "run", "dev"]
