FROM node:lts-jessie

# Node ENV 
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# copy pipeline
COPY . /usr/src/app

RUN rm -rf /usr/src/app/node_modules
RUN npm install 

# add cron & some nice to have
RUN apt-get update && apt-get install -y \
  cron \
  vim-tiny \
  bash \
  && rm -rf /var/lib/apt/lists/*

# cron setup
RUN crontab -l | cat - config/crontab-docker | crontab -
RUN cp /usr/share/zoneinfo/UTC /etc/localtime

# logs
RUN touch /var/log/cron.log
#RUN touch /var/log/mch-cosmo.log

# Run the command on container startup
CMD cron && tail -f /var/log/cron.log
