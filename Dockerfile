FROM node:22 AS build

WORKDIR /app
RUN npm install -g pnpm

COPY camera /app/camera
COPY certs /app/camera/certs
COPY camera-client /app/camera-client
COPY certs /app/camera-client/certs
COPY HomePage /app/landing-page

WORKDIR /app/camera
RUN pnpm install
RUN pnpm run build --base /camera/

WORKDIR /app/camera-client
RUN pnpm install
RUN pnpm run build --base /camera-client/

WORKDIR /app
COPY server /app/server
COPY certs /app/server/certs

WORKDIR /app/server
RUN pnpm install


FROM node:22 AS runtime

WORKDIR /app
RUN npm install -g pnpm

COPY --from=build /app/server /app
COPY --from=build  /app/camera/dist /app/camera
COPY --from=build  /app/camera-client/dist /app/camera-client
COPY --from=build  /app/landing-page /app/landing-page

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "index.js"]