FROM node:22.16.0-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

COPY .env .env

EXPOSE 8080

CMD [ "npm", "start" ]