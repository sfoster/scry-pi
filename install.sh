#!/bin/bash

command_exists () {
  type "$1" &> /dev/null ;
}

cd `dirname $0`

NODE_VERSION=5.3.0
SCRY_DIR=`pwd`

should_apt_update=true
should_install_certs=true

while getopts "uUC" opt; do
  case $opt in
    U)
      should_apt_update=false
      ;;
    u)
      should_apt_update=true
      ;;
    C)
      should_install_certs=false
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
  esac
done

if $should_apt_update; then
  sudo apt-get update
else
  echo "Skipping apt-get update" >&2
fi

packages="nodm openbox xorg xinit unclutter";

if ! command_exists wget;  then
  packages="$packages wget"
fi

if ! command_exists curl;  then
  packages="$packages curl ca-certificates"
fi

if $should_install_certs; then
  sudo apt-get install --reinstall ca-certificates
fi

if ! command_exists gpio-admin; then
  echo "gpio-admin not installed" >&2
  curl -SL --output quick2wire-gpio-admin.zip https://github.com/quick2wire/quick2wire-gpio-admin/archive/master.zip
  unzip -a quick2wire-gpio-admin.zip
  cd quick2wire-gpio-admin-master
  make && sudo make install
  sudo adduser $USER gpio
  cd .. && rm -R quick2wire-gpio-admin-master quick2wire-gpio-admin.zip
fi

if ! command_exists mosquitto;  then
  echo "Mosquitto not installed, adding package repository" >&2
  # install Mosquitto
  wget http://repo.mosquitto.org/debian/mosquitto-repo.gpg.key && sudo apt-key add mosquitto-repo.gpg.key
  sudo wget -O /etc/apt/sources.list.d/mosquitto-jessie.list http://repo.mosquitto.org/debian/mosquitto-jessie.list
  packages="$packages mosquitto"
  sudo apt-get update
fi

if ! command_exists mosquitto_pub;  then
  packages="$packages mosquitto-clients"
fi

if ! command_exists uzbl;  then
  packages="$packages uzbl"
fi

sudo apt-get install --no-install-recommends -y -q $packages

if ! command_exists node;  then
  echo "Nodejs not installed" >&2
  # install Node.js
  sudo  rm -rf /var/lib/apt/lists/* \
    && set -x \
    && curl -SLO "http://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-armv7l.tar.gz" \
    && sudo tar -xzf "node-v$NODE_VERSION-linux-armv7l.tar.gz" -C /usr/local --strip-components=1 \
    && rm "node-v$NODE_VERSION-linux-armv7l.tar.gz" \
    && sudo apt-get purge -y --auto-remove $buildDeps \
    && sudo npm config set unsafe-perm true -g --unsafe-perm \
    && sudo rm -rf /tmp/*
fi

if ! command_exists pm2;  then
  sudo npm install pm2 -g
fi

# add the SCRY_DIR to our defaults config
# install defaults config to set up common environment for services
echo \$SCRY_DIR=SCRY_DIR >> config/env
sudo install -D config/env /etc/default/scrypi

# install the gpio listener as a service
sudo install -D scry-gpio-service.sh /etc/init.d/scry-gpio-service.sh
sudo chmod +x /etc/init.d/scry-gpio-service.sh
sudo update-rc.d scry-gpio-service.sh defaults
sudo systemctl daemon-reload


# setup the monitor app
cd ./monitor
npm install
cd ..
