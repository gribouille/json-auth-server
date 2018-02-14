FROM postgres:10.0

LABEL maintainer="Gribouille <https://github.com/gribouille>"

EXPOSE 5432

# Initialize the database
ADD setup.sql /docker-entrypoint-initdb.d/