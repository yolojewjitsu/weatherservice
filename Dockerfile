FROM node:18 AS server-build

WORKDIR /app

COPY ./package*.json ./
COPY ./index.js ./
COPY ./swagger.js ./
COPY ./test ./test

RUN npm install

FROM node:18 AS client-build

WORKDIR /app/client

COPY ./client/package*.json ./
COPY ./client/vite.config.js ./
COPY ./client/tailwind.config.js ./
COPY ./client/postcss.config.js ./
COPY ./client/index.html ./
COPY ./client/src ./src

RUN npm install && npm run build

FROM node:18

WORKDIR /app

COPY --from=server-build /app /app

COPY --from=client-build /app/client/dist /app/public

RUN npm install --only=production

EXPOSE 3000

CMD ["node", "index.js"]
