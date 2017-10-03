FROM node:6

RUN mkdir -p /usr/src/cert
VOLUME ["/usr/src/cert"]

WORKDIR /usr/src/app
VOLUME ["/usr/src/app"]

EXPOSE 8080

CMD [ "node", "server/app.js" ]
