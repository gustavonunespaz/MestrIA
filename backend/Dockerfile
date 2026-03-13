# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY backend/package.json ./backend/

RUN npm install

COPY backend ./backend

WORKDIR /app/backend
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY backend/package.json ./backend/

RUN npm install --only=production

COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma

EXPOSE 3000

WORKDIR /app/backend
CMD ["node", "--require", "tsconfig-paths/register", "dist/main.js"]
