FROM ubuntu:bionic

USER root
RUN apt-get update
RUN apt-get install sudo curl -y
ADD ./sudoers.txt /etc/sudoers
RUN chmod 440 /etc/sudoers
RUN useradd -ms /bin/bash sandbox
RUN adduser sandbox sudo

# nvm environment variables
ENV NVM_DIR /home/sandbox/.nvm
ENV NODE_VERSION 12.13.1
ENV NVM_VERSION 0.35.1

# install nvm
# https://github.com/creationix/nvm#install-script
RUN mkdir $NVM_DIR
RUN curl --silent -o- https://raw.githubusercontent.com/nvm-sh/nvm/v${NVM_VERSION}/install.sh | bash

# install node and npm
RUN . $NVM_DIR/nvm.sh \
  && nvm install $NODE_VERSION \
  && nvm alias default $NODE_VERSION \
  && nvm use default

# add node and npm to path so the commands are available
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# install yarn
RUN npm i -g yarn

# confirm installation
RUN node -v
RUN npm -v
RUN yarn -v

ENV PATH $PATH:/home/sandbox/product/scripts/bin
ENV PRODUCT_DIR /home/sandbox/product

USER sandbox
WORKDIR /home/sandbox/product
CMD echo 'Created sandbox caontainer'
