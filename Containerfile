FROM docker.io/node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY src ./src

ENV PORT=80
ENV CORS_ORIGIN=*

EXPOSE 80

CMD ["node", "src/index.js"]
