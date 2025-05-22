FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5173  # Default port for Vite dev server

CMD ["npm", "run", "dev"]
