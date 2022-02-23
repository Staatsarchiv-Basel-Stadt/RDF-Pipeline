FROM node:16-buster

# Fix deb install
ENV DEBIAN_FRONTEND noninteractive
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

# Node ENV
RUN mkdir -p /usr/src/app
RUN mkdir -p /root/.ssh
RUN chmod 700 /root/.ssh

# Configuration
ARG git_branch="development"
ARG STARDOG_VERSION="7.8.2"

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
  curl \
  && rm -rf /var/lib/apt/lists/*

# Install Stardog
RUN curl http://packages.stardog.com/stardog.gpg.pub | apt-key add
RUN echo "deb http://security.debian.org/debian-security stretch/updates main" >> /etc/apt/sources.list
RUN echo "deb http://packages.stardog.com/deb/ stable main" >> /etc/apt/sources.list
RUN apt-get update && apt-get install -y openjdk-8-jdk "stardog=${STARDOG_VERSION}"

# Do GIT and Repository
WORKDIR /opt/StABS-scope2RDF
RUN git init \
  && git config http.proxyAuthMethod 'basic' \
  && git remote add origin https://github.com/Staatsarchiv-Basel-Stadt/StABS-scope2RDF.git \
  && git pull origin "${git_branch}"

WORKDIR /usr/src/app

# Copy Configuration Files (from /credentials to whatever needed)
COPY credentials/scope-virtual.properties ./credentials/scope-virtual.properties
COPY credentials/netrc /root/.netrc
COPY credentials/environment /etc/environment
RUN echo 'bootstrapenv () { for line in $( cat /etc/environment ) ; do export $line ; done }' >> /root/.bashrc

# Copy Cron Jobs
RUN mkdir -p ./cron
COPY cron/crontab-docker ./cron/
COPY cron/cron-mappingUpdate.sh ./cron/
COPY cron/cron-materialize.sh ./cron/
COPY cron/cron-publish.sh ./cron/

# Copy Scripts and Data
RUN  mkdir -p ./pipelines
RUN  mkdir -p ./lib
RUN  mkdir -p ./metadata
RUN  mkdir -p ./testdata
COPY package.json package-lock.json ./
RUN npm ci
COPY pipelines/staatsarchiv.ttl ./pipelines/
COPY lib/* ./lib/
COPY metadata/* ./metadata/
COPY testdata/* ./testdata/
COPY shell ./shell

WORKDIR /opt/StABS-scope2RDF

# Set Cron (Note that time is set to UTC!)
#RUN cp /usr/share/zoneinfo/UTC /etc/localtime

# Logs
#RUN touch /var/log/cron.log
# cron will log to stdout, as well as the cronjobs itself so no local logs that fill up
CMD crontab /usr/src/app/cron/crontab-docker \
  && cron \
  && tail -f
