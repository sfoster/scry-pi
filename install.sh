#!/bin/bash

NODE_VERSION=5.3.0

command_exists () {
    type "$1" &> /dev/null ;
}

apt-get update
apt-get install --no-install-recommends -y -q wget curl

if ! command_exists mosquitto;  then
  echo "Mosquitto not installed" >&2
  # install Mosquitto
  wget http://repo.mosquitto.org/debian/mosquitto-repo.gpg.key && apt-key add mosquitto-repo.gpg.key
  wget -O /etc/apt/sources.list.d/mosquitto-jessie.list http://repo.mosquitto.org/debian/mosquitto-jessie.list
  apt-get update && apt-get install --no-install-recommends -y -q mosquitto
fi

if ! command_exists node;  then
  echo "Nodejs not installed" >&2
  # install Node.js
  buildDeps='curl ca-certificates' \
    && set -x \
    && apt-get update && apt-get install -y $buildDeps --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && curl -SLO "http://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-armv7l.tar.gz" \
    && tar -xzf "node-v$NODE_VERSION-linux-armv7l.tar.gz" -C /usr/local --strip-components=1 \
    && rm "node-v$NODE_VERSION-linux-armv7l.tar.gz" \
    && apt-get purge -y --auto-remove $buildDeps \
    && npm config set unsafe-perm true -g --unsafe-perm \
    && rm -rf /tmp/*
fi

if ! command_exists pm2;  then
  npm install pm2 -g
fi

# install defaults script to set up common environment for services
cp common/defaults /etc/default/scrypi
chmod +x /etc/default/scrypi

# install the button listener as a service
cp buttonservice.sh /etc/init.d/buttonservice.sh
chmod +x /etc/init.d/buttonservice.sh
update-rc.d /etc/init.d/buttonservice.sh defaults
systemctl daemon-reload

# setup the monitor app
cd ./monitor
npm install
cd ..



