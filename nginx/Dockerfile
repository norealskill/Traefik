FROM nginx:1.17.8-alpine

WORKDIR /usr/share/nginx/html

RUN apk add --update nodejs npm

COPY package.json .
COPY index.html .
COPY server.js .

RUN npm install
