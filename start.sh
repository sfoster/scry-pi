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
pm2 stop monitor/index.js && pm2 delete monitor/index.js
pm2 start monitor/index.js