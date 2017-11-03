#dodcker image from ubuntu
FROM ubuntu:16.04

# Replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

#install basic tools - what kind of monster would strip curl and sudo?
RUN apt-get update --fix-missing
RUN apt-get update && apt-get install -qq -y curl
RUN apt-get update && apt-get install -qq -y sudo
RUN apt-get install -y build-essential libssl-dev

#configure/define environment variables for nvm/node installation
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 8.4.0

#install nvm and node
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.30.1/install.sh | bash \
    && source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

#ensure node installation is within scope of environment
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

#add application files to docker image directory
ADD /app /usr/app

#locate
WORKDIR /usr/app

# Install app dependencies
RUN npm install

#expose ports, fire up application
EXPOSE  80
CMD node app.js