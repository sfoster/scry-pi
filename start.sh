#!/bin/sh

command_exists () {
  type "$1" &> /dev/null ;
}

cd `dirname $0`
logfile=logs/start.log
echo running start.sh at `date "+%c"` > $logfile

source ./config/env
echo "MQTT_HOST: $MQTT_HOST" >> $logfile

# start up mosquitto
# start up our button publisher
if command_exists mosquitto ; then
   sudo /etc/init.d/mosquitto stop
   mosquitto --daemon
   echo "Started mosquitto" >> $logfile
else
   echo "Couldnt start mosquitto" >> $logfile
fi

# start up our button publisher
MQTT_HOST=$MQTT_HOST ./buttonpi/button.py &
echo "Started button publisher" >> $logfile

# start up the node apps
pm2 stop all
sed "s|__MQTT_HOST__|$MQTT_HOST|" ./config/pm2-config.template > ./config.json
pm2 start ./config.json
echo "Started apps with pm2" >> $logfile

echo "Done" >> $logfile
