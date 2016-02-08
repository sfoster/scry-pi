#!/bin/sh

### BEGIN INIT INFO
# Provides:          buttonpi
# Required-Start:    $network $remote_fs $syslog
# Required-Stop:     $network $remote_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Put a short description of the service here
# Description:       Put a long description of the service here
### END INIT INFO

# Where to install the script and what to call it
DIR=/home/pi/mirror/buttonpi
DAEMON=$DIR/button.py
DAEMON_NAME=buttonpi

[ -f /etc/default/scrypi ] && . /etc/default/scrypi

# Add any command line options for your daemon here
DAEMON_OPTS=""

# This next line determines what user the script runs as.
# Root generally not recommended but necessary if you are using the Raspberry Pi GPIO from Python.
DAEMON_USER=root

# The process ID of the script when it runs is stored here:
PIDFILE=/var/run/$DAEMON_NAME.pid

. /lib/lsb/init-functions

if [ -z "$MQTT_HOST" ] ;  then
  echo "MQTT_HOST is not set, please set it in /etc/default/scrypi" >&2
  exit 1
else
  echo "Using host: $MQTT_HOST" >&2
fi

do_start () {
    echo "Starting system $DAEMON_NAME daemon on $MQTT_HOST"
    log_daemon_msg "Starting system $DAEMON_NAME daemon on $MQTT_HOST"
    start-stop-daemon --start --background --pidfile $PIDFILE --make-pidfile --user $DAEMON_USER --chuid $DAEMON_USER --startas $DAEMON -- $DAEMON_OPTS
    log_end_msg $?
}
do_stop () {
    log_daemon_msg "Stopping system $DAEMON_NAME daemon"
    start-stop-daemon --stop --pidfile $PIDFILE --retry 10
    log_end_msg $?
}

case "$1" in

    start|stop)
        do_${1}
        ;;

    restart|reload|force-reload)
        do_stop
        do_start
        ;;

    status)
        status_of_proc "$DAEMON_NAME" "$DAEMON" && exit 0 || exit $?
        ;;

    *)
        echo "Usage: /etc/init.d/$DAEMON_NAME {start|stop|restart|status}"
        exit 1
        ;;

esac
exit 0