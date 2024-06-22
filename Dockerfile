FROM node:18-alpine3.15 AS builder
WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY . .
RUN npm run build

FROM node:18-alpine3.15
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

CMD [ "node", "dist/main" ]
