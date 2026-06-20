FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
# python3/make/g++ are needed to build the better-sqlite3 native addon
RUN apk add --no-cache python3 make g++
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm build

FROM base AS runtime
ENV NODE_ENV=production
# scenarios are read from disk at runtime and aren't bundled by Nitro's static analysis
COPY --from=build /app/.output ./.output
COPY --from=build /app/server/data ./server/data
RUN mkdir -p .data
VOLUME ["/app/.data"]
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
