FROM node:22 AS build

WORKDIR /app
RUN npm install -g pnpm

COPY camera /app/camera
COPY camera-client /app/camera-client

WORKDIR /app/camera
RUN pnpm install
RUN pnpm run build

WORKDIR /app/camera-client
RUN pnpm install
RUN pnpm run build

WORKDIR /app
COPY server /app/server

WORKDIR /app/server
RUN pnpm install


FROM node:22 AS runtime

WORKDIR /app
RUN npm install -g pnpm

COPY --from=build /app/server /app/server
COPY --from=build  /app/camera/dist /app/server/camera
COPY --from=build  /app/camera-client/dist /app/server/camera-client
COPY certs /app/server/certs


EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "server/index.js"]