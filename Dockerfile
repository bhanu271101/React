# Stage 1: Build the app
FROM node:20 AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the app
COPY . .

# Build the app (use "build" for production, not "dev")
RUN npm run dev


# Expose port 80
EXPOSE 80
