FROM node:18.12.1

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn --pure-lockfile

COPY . .

CMD [ "yarn", "start" ]
