#!/bin/sh

cd `dirname $0`

source common/defaults

# start up mosquitto
sudo /etc/init.d/mosquitto stop
mosquitto --daemon

# start up our button publisher
sudo /etc/init.d/buttonservice.sh stop
sudo /etc/init.d/buttonservice.sh start

# start up the mqtt monitor
pm2 stop monitor && pm2 delete monitor
sed "s|__MQTT_HOST__|$MQTT_HOST|" monitor/config.template > monitor/config.json
pm2 start monitor/config.json --name="monitor"