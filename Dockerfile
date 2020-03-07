FROM node:latest
WORKDIR /usr/app
COPY package*.json ./
ENV NODE_ENV=production
RUN npm install
COPY . .
RUN npm run build
ADD ormconfig.docker.js ormconfig.js

WORKDIR  ./dist
COPY wait-for-it.sh .
CMD node index.js