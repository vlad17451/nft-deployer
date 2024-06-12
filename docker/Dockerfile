FROM postgres:14

EXPOSE 5432

COPY ./init-db.sql /docker-entrypoint-initdb.d/

CMD ["postgres"]