FROM node:23.0.0 as build

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

CMD npm run start

EXPOSE 3000
