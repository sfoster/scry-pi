#!/bin/sh

cd `dirname $0`

# start up mosquitto
mosquitto --daemon

# start up our button publisher
/etc/init.d/buttonservice.sh start

# start up the mqtt monitor
pm2 start monitor/index.js