FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN addgroup -g 1001 -S gatepilot && \
    adduser -S gatepilot -u 1001 -G gatepilot

RUN mkdir -p logs && chown -R gatepilot:gatepilot /app

USER gatepilot

EXPOSE 3000

CMD ["node", "src/server.js"]
