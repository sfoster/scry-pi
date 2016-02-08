#!/usr/bin/env python
import os
import logging
import logging.handlers
import RPi.GPIO as GPIO
import paho.mqtt.client as paho
import argparse
import sys

LOG_FILENAME = "/tmp/buttonservice.log"
LOG_LEVEL = logging.INFO  # Could be e.g. "DEBUG" or "WARNING"

# ---------------------------------------------------------------
# Configure logging
#  to log to a file, making a new file at midnight and keeping the last 3 day's data
# Give the logger a unique name (good practice)
logger = logging.getLogger(__name__)
# Set the log level to LOG_LEVEL
logger.setLevel(LOG_LEVEL)
# Make a handler that writes to a file, making a new file at midnight and keeping 3 backups
handler = logging.handlers.TimedRotatingFileHandler(LOG_FILENAME, when="midnight", backupCount=3)
# Format each log message like this
formatter = logging.Formatter('%(asctime)s %(levelname)-8s %(message)s')
# Attach the formatter to the handler
handler.setFormatter(formatter)
# Attach the handler to the logger
logger.addHandler(handler)

# Make a class we can use to capture stdout and sterr in the log
class MyLogger(object):
        def __init__(self, logger, level):
                """Needs a logger and a logger level."""
                self.logger = logger
                self.level = level

        def write(self, message):
                # Only log if there is a message (not just a new line)
                if message.rstrip() != "":
                        self.logger.log(self.level, message.rstrip())

# Replace stdout with logging to file at INFO level
sys.stdout = MyLogger(logger, logging.INFO)
# Replace stderr with logging to file at ERROR level
sys.stderr = MyLogger(logger, logging.ERROR)

# /Configure logging
# ---------------------------------------------------------------

mqtt_host = os.environ.get('MQTT_HOST', 'test.mosquitto.org')
mqtt_port = os.environ.get('MQTT_PORT', '1883')

# which pin is the button on?
btn_channel = 18
btn_state = False
self_topic = 'button'

# Define and parse command line arguments
parser = argparse.ArgumentParser(description="My simple Python service")
parser.add_argument("--host", help="MQTT host publish to  (default '" + mqtt_host + "')")
parser.add_argument("--port", help="MQTT port publish to  (default '" + str(mqtt_port) + "')")
parser.add_argument("--channel", help="I/O channel to watch (default '" + str(btn_channel) + "')")
parser.add_argument("-l", "--log", help="file to write log to (default '" + LOG_FILENAME + "')")

args = parser.parse_args()
if args.host:
        mqtt_host = args.host
if args.port:
        mqtt_port = args.port
if args.channel:
        btn_channel = args.channel
if args.log:
        LOG_FILENAME = args.log

logger.info('Using host: %s' % mqtt_host)

GPIO.setmode(GPIO.BCM)
# use the software-defined pull-up resistor
GPIO.setup(btn_channel, GPIO.IN, pull_up_down=GPIO.PUD_UP)

def on_rising(channel):
    logger.info("Rising on channel %s" % channel)
    client.publish(self_topic, "buttonup:" + str(btn_channel), 0)

def on_falling(channel):
    logger.info("Falling on channel %s" % channel)

def on_connect(pahoClient, obj, rc):
    # Once connected, publish message
    logger.info("Connected Code = %d on %s:%s" % (rc,mqtt_host,mqtt_port))

    GPIO.add_event_detect(btn_channel, GPIO.RISING, callback=on_rising, bouncetime=200)
    client.publish(self_topic, "hello", 0)

def on_log(pahoClient, obj, level, string):
    logger.debug("log:" + string)

def on_publish(pahoClient, data, mid):
    logger.info("Published %s: %s" % (mid, data))

def on_disconnect(pahoClient, obj, rc):
    logger.info("Disconnected")

# client_id="rpi-io", clean_session=True, userdata=None
client = paho.Client()

# Register callbacks
client.on_connect = on_connect
client.on_log = on_log
client.on_publish = on_publish
client.on_disconnnect = on_disconnect

# connect and loop
client.connect(mqtt_host, mqtt_port)
client.loop_forever()

logger.info("(info) Connected on %s:%s, and looping" % (mqtt_host, mqtt_port))
print "(print) Connected on %s:%s, and looping" % (mqtt_host, mqtt_port)
