FROM node:5.6

ADD . /source

CMD node /source/main.js