#!/bin/sh

command_exists () {
  type "$1" &> /dev/null ;
}

cd `dirname $0`

[ -f ./common/defaults ] && . common/defaults
echo "MQTT_HOST: $MQTT_HOST"

# start up mosquitto
# start up our button publisher
if command_exists mosquitto ; then
   sudo /etc/init.d/mosquitto stop
   mosquitto --daemon
fi

# start up our button publisher
MQTT_HOST=$MQTT_HOST ./buttonpi/button.py &

# start up the node apps
pm2 stop all
sed "s|__MQTT_HOST__|$MQTT_HOST|" ./config.template > ./config.json
pm2 start ./config.json

