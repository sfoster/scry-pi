#!/bin/bash

NODE_VERSION=5.3.0

command_exists () {
  type "$1" &> /dev/null ;
}

should_update=true

while getopts "uU" opt; do
  case $opt in
    U)
      should_update=false
      ;;
    u)
      should_update=true
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
  esac
done

if $should_update; then
  sudo apt-get update
else
  echo "Skipping apt-get update" >&2
fi

if ! command_exists wget;  then
  sudo apt-get install --no-install-recommends -y -q wget
fi

if ! command_exists curl;  then
  sudo apt-get install --no-install-recommends -y -q curl ca-certificates
fi

sudo apt-get install --reinstall ca-certificates

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
  echo "Mosquitto not installed" >&2
  # install Mosquitto
  wget http://repo.mosquitto.org/debian/mosquitto-repo.gpg.key && sudo apt-key add mosquitto-repo.gpg.key
  sudo wget -O /etc/apt/sources.list.d/mosquitto-jessie.list http://repo.mosquitto.org/debian/mosquitto-jessie.list
  sudo apt-get update && sudo apt-get install --no-install-recommends -y -q mosquitto
fi

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

# install defaults script to set up common environment for services
sudo cp common/defaults /etc/default/scrypi
sudo chmod +x /etc/default/scrypi

# install the button listener as a service
sudo cp buttonservice.sh /etc/init.d/buttonservice.sh
sudo chmod +x /etc/init.d/buttonservice.sh
sudo update-rc.d buttonservice.sh defaults
sudo systemctl daemon-reload

# setup the monitor app
cd ./monitor
npm install
cd ..
