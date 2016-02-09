#!/bin/sh

cd `dirname $0`

[ -f ./common/defaults ] && . common/defaults
echo "MQTT_HOST: $MQTT_HOST"

# start up mosquitto
sudo /etc/init.d/mosquitto stop
mosquitto --daemon

# start up our button publisher
sudo /etc/init.d/buttonservice.sh stop
sudo /etc/init.d/buttonservice.sh start

# start up the mqtt monitor
cd monitor
pm2 stop monitor && pm2 delete monitor
sed "s|__MQTT_HOST__|$MQTT_HOST|" ./config.template > ./config.json
pm2 start ./config.json --name="monitor"
cd ..