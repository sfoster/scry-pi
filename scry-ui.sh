#!/bin/sh
cd `dirname $0`
while [ 1 ];
do
   uzbl -u http://www.google.com/ -c /home/pi/uzbl.conf 
done
