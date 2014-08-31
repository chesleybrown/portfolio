# Base nginx image
FROM dockerfile/nginx

MAINTAINER Chesley Brown <me@chesleybrown.ca>

# Install Node.js
RUN apt-get update
RUN apt-get install -y -q software-properties-common
RUN add-apt-repository ppa:chris-lea/node.js
RUN apt-get update
RUN apt-get install -y -q nodejs

# Install Consul
ADD https://dl.bintray.com/mitchellh/consul/0.3.1_linux_amd64.zip /tmp/consul.zip
RUN cd /usr/local/bin && unzip /tmp/consul.zip && chmod +x /usr/local/bin/consul && rm /tmp/consul.zip

# Set Env
ENV APP_DOMAIN chesleybrown.ca

# Set work dir
WORKDIR /usr/src/app

# Install node dependencies
ADD package.json /usr/src/app/package.json
RUN npm install --verbose

# Install bower dependencies
ADD .bowerrc /usr/src/app/.bowerrc
ADD bower.json /usr/src/app/bower.json
RUN ./node_modules/bower/bin/bower --allow-root install

# Add cron for feed refresh
ADD cron /etc/cron
RUN chmod +x -R /etc/cron
RUN cron

# Add app files
ADD web /usr/src/app/web
ADD app.js /usr/src/app/app.js
ADD settings.js /usr/src/app/settings.js

# Set permissions for build
RUN chown -R www-data:www-data web

# Add nginx conf
ADD nginx.conf /etc/nginx/nginx.conf

# Add consul conf
ADD consul.d /etc/consul.d

# Add startup script
ADD start /usr/local/bin/start
RUN chmod +x /usr/local/bin/start

# Set server port
EXPOSE 80

# Add blog image volume
VOLUME /usr/src/app/web/img/blog

CMD ["start"]