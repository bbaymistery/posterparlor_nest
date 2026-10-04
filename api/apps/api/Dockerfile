# Dockerfile for NestJS API in Nx Workspace
FROM node:20-alpine AS base

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npx nx build api --configuration=production

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=base /app/dist/apps/api ./
COPY package*.json ./
RUN npm ci --omit=dev

EXPOSE 3000
CMD ["node", "main.js"]
