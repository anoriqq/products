FROM ubuntu:bionic

USER root
RUN apt-get update
RUN apt-get install sudo curl -y
ADD ./sudoers.txt /etc/sudoers
RUN chmod 440 /etc/sudoers
RUN useradd -ms /bin/bash sandbox
RUN adduser sandbox sudo

USER sandbox

WORKDIR $WORK_DIR
CMD echo 'Created sandbox caontainer'
