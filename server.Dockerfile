FROM node:9.3.0

LABEL maintainer="Gribouille <https://github.com/gribouille>"

RUN npm install -g nodemon

RUN groupadd -r user
RUN useradd -r -m -g user jas

USER jas
WORKDIR /home/jas

ENV NODE_ENV production

ADD src src
ADD package.json .
RUN npm install

ENTRYPOINT [ "nodemon", "src/server.js" ]