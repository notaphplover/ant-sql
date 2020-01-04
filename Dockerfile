FROM node:12.13.1-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --quiet

COPY . .

CMD [ "npm", "run", "build"]
