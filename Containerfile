FROM docker.io/oven/bun:alpine AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:alpine AS runtime

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY src ./src

ENV PORT=80
ENV CORS_ORIGIN=*

EXPOSE 80

CMD ["bun", "src/index.js"]
