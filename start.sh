#!/bin/bash

command_exists () {
  type "$1" &> /dev/null ;
}

CONFIG=/etc/default/scrypi

if ! [ -f $CONFIG ]; then
  echo "$CONFIG not found, it should have installed when you ran install.sh?" >&2
  exit 1
fi

source $CONFIG

if [ -z "$SCRY_DIR" ] ;  then
  echo "SCRY_DIR is not set, it should have been populated when you ran install.sh?" >&2
  exit 1
fi

cd $SCRY_DIR
logfile=logs/start.log
echo running start.sh at `date "+%c"` > $logfile

echo "MQTT_HOST: $MQTT_HOST" >> $logfile

# start up mosquitto
# start up our button publisher
sudo /etc/init.d/mosquitto restart
echo "Re-started mosquitto broker" >> $logfile

# start up our button publisher
sudo /etc/init.d/scry-gpio-service.sh restart
echo "Re-started button publisher" >> $logfile

# start up the node apps
pm2 stop all
sed "s|__MQTT_HOST__|$MQTT_HOST|" ./config/pm2-config.template > ./config.json
pm2 start ./config.json
echo "Started apps with pm2" >> $logfile

echo "Done" >> $logfile
