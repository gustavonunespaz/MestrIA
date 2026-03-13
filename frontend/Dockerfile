FROM node:20-alpine AS build

WORKDIR /app

# We are building from the root context (.)
COPY package*.json ./
COPY frontend/package.json ./frontend/

# If we were using npm workspaces we'd install here
RUN cd frontend && npm install

COPY frontend ./frontend

WORKDIR /app/frontend

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
