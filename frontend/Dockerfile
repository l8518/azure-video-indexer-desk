FROM node:8.4
WORKDIR /app

RUN npm install @nestjs/cli@6.6.3 -g

# NPM Install Stuff
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
RUN npm install

COPY . /app

RUN npm install
CMD npm run start:dev