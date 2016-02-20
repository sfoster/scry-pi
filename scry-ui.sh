#!/bin/sh

CONFIG=/etc/default/scrypi
source $CONFIG
if [ -z "$HTTP_ORIGIN" ] ;  then
  echo "scry-ui: HTTP_ORIGIN is not set, it should have been populated when you ran install.sh?" >&2
  exit 1
fi

# wait for the server to start up
while ! curl -s -o /dev/null $HTTP_ORIGIN/; do
  sleep 10
done

while [ 1 ]; do
   uzbl -u $HTTP_ORIGIN/ -c /home/pi/uzbl.conf
done
