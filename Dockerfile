FROM node:18-bullseye-slim
WORKDIR /usr/src/app
COPY server/package*.json ./
RUN npm install --production
COPY server/ ./server/
WORKDIR /usr/src/app/server
ENV PORT=3000
EXPOSE 3000
CMD ["node", "index.js"]
