FROM node:12-buster

# Node ENV 
RUN mkdir -p /usr/src/app
RUN mkdir -p /root/.ssh
RUN chmod 700 /root/.ssh
WORKDIR /usr/src/app

# copy config
COPY credentials/scope-virtual.properties /usr/src/app/credentials/scope-virtual.properties 
COPY credentials/ssh-config /root/.ssh/config
COPY credentials/id_rsa* /root/.ssh/
COPY credentials/netrc /root/.netrc

# copy cron jobs
RUN mkdir -p /usr/src/app/cron
COPY cron/crontab-docker /usr/src/app/cron
COPY cron/cron-mappingUpdate.sh /usr/src/app/cron
COPY cron/cron-materialize.sh /usr/src/app/cron
COPY cron/cron-publish.sh /usr/src/app/cron

# copy node scripts
RUN  mkdir -p /usr/src/app/pipelines
RUN  mkdir -p /usr/src/app/metadata
COPY shell /usr/src/app/shell
#COPY ecosystem.config.js /usr/src/app/
COPY package.json /usr/src/app/
COPY pipelines/staatsarchiv.ttl /usr/src/app/pipelines/
COPY metadata/* /usr/src/app/metadata/

RUN npm install 

# add nice to have
RUN apt-get update && apt-get install -y \
  vim-tiny \
  git \
  bash \
  cron \
  && rm -rf /var/lib/apt/lists/*

# Clone the initial repo & set git proxy
RUN git clone https://github.com/Staatsarchiv-Basel-Stadt/StABS-scope2RDF.git /opt/StABS-scope2RDF.git
COPY credentials/gitconfig /root/.gitconfig

# cron setup. Note that time is set to UTC!
RUN crontab -l | cat - cron/crontab-docker | crontab -
#RUN cp /usr/share/zoneinfo/UTC /etc/localtime

# logs
#RUN touch /var/log/cron.log

# cron will log to stdout, as well as the crontjobs itself so no local logs that fill up
CMD cron && tail -f 
