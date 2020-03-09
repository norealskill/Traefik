FROM oraclelinux:7-slim

WORKDIR /usr/src/app

ADD server.js ./
ADD package.json ./

RUN yum update -y
RUN yum install -y oracle-release-el7
RUN yum install -y oracle-nodejs-release-el7
RUN yum install -y oracle-instantclient19.3-basic.x86_64
RUN yum install -y nodejs
RUN yum clean all
RUN npm install

CMD ["npm", "start"]
