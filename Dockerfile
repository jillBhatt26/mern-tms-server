FROM node:16.16.0-alpine

RUN yarn global add nodemon

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY ./ ./

EXPOSE 5000

CMD ["yarn", "run", "dev"]