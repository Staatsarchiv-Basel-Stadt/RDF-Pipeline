FROM node:14-buster

# Node ENV 
RUN mkdir -p /usr/src/app
RUN mkdir -p /root/.ssh
RUN chmod 700 /root/.ssh
WORKDIR /usr/src/app

# Copy Configuration Files (from /credentials to whatever needed)
COPY credentials/scope-virtual.properties /usr/src/app/credentials/scope-virtual.properties 
COPY credentials/ssh-config /root/.ssh/config
COPY credentials/id_rsa* /root/.ssh/
COPY credentials/netrc /root/.netrc
COPY credentials/environment /etc/environment
RUN echo 'bootstrapenv () { for line in $( cat /etc/environment ) ; do export $line ; done }' >> /root/.bashrc

# Copy Cron Jobs
RUN mkdir -p /usr/src/app/cron
COPY cron/crontab-docker /usr/src/app/cron/
COPY cron/cron-mappingUpdate.sh /usr/src/app/cron/
COPY cron/cron-materialize.sh /usr/src/app/cron/
COPY cron/cron-publish.sh /usr/src/app/cron/

# Copy Node Scripts
RUN  mkdir -p /usr/src/app/pipelines
RUN  mkdir -p /usr/src/app/metadata
COPY shell /usr/src/app/shell
#COPY ecosystem.config.js /usr/src/app/
COPY package.json /usr/src/app/
COPY pipelines/staatsarchiv.ttl /usr/src/app/pipelines/
COPY metadata/* /usr/src/app/metadata/

RUN npm install 

# Add Things Nice To Have
RUN rm -f /etc/vim/vimrc \
  && apt-get update \
  && apt-get install -y \
  vim-tiny \
  less \
  git \
  bash \
  cron \
  tmux \
  netcat-openbsd \
  && rm -rf /var/lib/apt/lists/*

# Do GIT and Repository
WORKDIR /opt/StABS-scope2RDF
RUN git init \
  && git config http.proxyAuthMethod 'basic' \
  && git remote add origin https://github.com/Staatsarchiv-Basel-Stadt/StABS-scope2RDF.git \
  && git pull origin main

# Set Cron (Note that time is set to UTC!)
#RUN cp /usr/share/zoneinfo/UTC /etc/localtime

# Logs
#RUN touch /var/log/cron.log
# cron will log to stdout, as well as the cronjobs itself so no local logs that fill up
CMD crontab /usr/src/app/cron/crontab-docker \
  && cron \
  && tail -f 
