#!/bin/bash

dev() {
  NODE_ENV=development nodemon src/server.js
}

db_start() {
  docker container run --name auth-postgres \
    -e POSTGRES_PASSWORD=mydbpass \
    -e POSTGRES_USER=mydbuser \
    -e POSTGRES_DB=auth-db \
    -p 5432:5432 \
    -d postgres:10.0
}

db_stop() {
  docker stop auth-postgres && docker container rm auth-postgres
}

db_init() {
  docker run -it --rm --link auth-postgres:postgres \
    -e PGPASSWORD=mydbpass \
    --mount type=bind,src="$(pwd)",dst="/tmp" \
    postgres psql -h postgres -U mydbuser -d auth-db -a -f /tmp/setup.sql
}

db_psql() {
  docker run -it --rm --link auth-postgres:postgres \
    --mount type=bind,src="$(pwd)/test/images",dst="/tmp/images" \
    postgres psql -h postgres -U mydbuser -d auth-db
}

build() {
  docker image build -t gribouille/jas:0.1.0 -f Dockerfile .
}

start() {
  docker container run --rm --link auth-postgres:auth-postgres \
    --mount type=bind,src="$(pwd)",dst="/usr/src/app" \
    -w /usr/src/app --name auth-db -p 8080:8080 node:8.8.1 node server.js
}

doc() {
  graphdoc -s doc/schema.graphql  -o doc/html
}



"$@"