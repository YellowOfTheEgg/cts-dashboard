FROM node:20.18.0 as build

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . .
#COPY package*.json ./

RUN npm ci --verbose


RUN npm run build

CMD npm run start

EXPOSE 3000
