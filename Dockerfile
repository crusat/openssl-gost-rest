FROM rnix/openssl-gost

RUN apt-get update && apt-get upgrade curl -y
RUN mkdir -p /build
WORKDIR /build

RUN curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n && bash n lts

RUN mkdir -p /code/keys && mkdir -p /code/tmp
WORKDIR /code

ADD . /code/

CMD node index.js
