#!/usr/bin/env python
import os
import time
import logging
import logging.handlers
import RPi.GPIO as GPIO
import paho.mqtt.client as paho
import simplejson as json
import argparse
import sys

LOG_FILENAME = "/tmp/scry-gpio.log"
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

mqtt_host = os.environ.get('MQTT_HOST', '127.0.0.1')
mqtt_port = os.environ.get('MQTT_PORT', '1883')
scry_dir =  os.environ.get('SCRY_DIR', '1883')
config_file = os.path.join(os.path.dirname(__file__), 'config.json')

io_config = { 'prefix': '/', 'inputs': [], 'outputs': [] }

# Define and parse command line arguments
parser = argparse.ArgumentParser(description="Watch for button presses")
parser.add_argument("--host", help="MQTT host publish to  (default '" + mqtt_host + "')")
parser.add_argument("--port", help="MQTT port publish to  (default '" + str(mqtt_port) + "')")
parser.add_argument("--config", help="config filename '" + str(config_file) + "')")
parser.add_argument("-l", "--log", help="file to write log to (default '" + LOG_FILENAME + "')")

args = parser.parse_args()
if args.host:
        mqtt_host = args.host
if args.port:
        mqtt_port = args.port
if args.config:
        config_file = args.config
if args.log:
        LOG_FILENAME = args.log


if os.path.isfile(config_file):
    with open(config_file) as data_file:
        data = json.load(data_file)
        if 'inputs' in data:
            # merge them
            io_config['inputs'] = io_config['inputs'] + data['inputs']
            logger.info("merged inputs from config: %s" % json.dumps(io_config['inputs']))
        if 'outputs' in data:
            # merge them
            io_config['outputs'] = io_config['outputs'] + data['outputs']
            logger.info("merged outputs from config: %s" % json.dumps(io_config['outputs']))
else:
    logger.info("No config found at %s, using default" % (config_file))


logger.info('Using host: %s' % mqtt_host)
GPIO.setmode(GPIO.BOARD)

pud_map = {
    'up': GPIO.PUD_UP,
    'down': GPIO.PUD_DOWN,
    'off': GPIO.PUD_OFF
}

for inp in io_config['inputs']:
    logger.info('Got input defn %s' % json.dumps(inp))
    # use the software-defined pull-up resistor?
    pud = inp['pull_up_down'] if 'pull_up_down' in inp else 'off';
    if not pud in pud_map:
        pud = 'off';
    logger.info('set up pin %s as GPIO.IN, with pull_up_down: %s' % (inp['pin'], pud))
    GPIO.setup(inp['pin'], GPIO.IN, pull_up_down=pud_map[pud])

def register_input_events(inp):
    logger.info('register_input_events for %s: %s' % (inp['name'], json.dumps(inp)))
    if not 'events' in inp:
        return None
    pin = inp['pin']
    name = inp['name']
    topic = io_config['prefix'] + inp['topic']
    events = inp['events']
    for phase in events:
        logger.info('register for %s' % phase)
        if phase == 'rising' or phase == 'falling':
            phase_flag = GPIO.FALLING if phase == 'falling' else GPIO.RISING
            debounce = events[phase] if events[phase] >= 0 else 200
            logger.info('add event detect for pin: %s, phase: %s, phase_flag: %s, topic: %s, debounce: %s' \
                        % (pin, phase, phase_flag, topic, debounce))
            GPIO.add_event_detect(pin, phase_flag, \
                                  # json.dumps({ pin: pin, name: name, event: phase})
                                  callback=lambda msg: client.publish(topic, name +':'+time.strftime("%s"), 0), \
                                  bouncetime=debounce)
        else:
            logger.info("Unknown input event phase %s, skipping" % phase)


def unregister_input_events(inp):
    if not 'events' in inp:
        return None
    pin = inp['pin']
    GPIO.remove_event_detect(pin)

def on_rising(msg):
    logger.info("Connected Code = %d on %s:%s" % (rc,mqtt_host,mqtt_port))

def on_connect(pahoClient, obj, rc):
    # Once connected, hook into i/o events
    logger.info("Connected Code = %d on %s:%s" % (rc,mqtt_host,mqtt_port))

    for inp in io_config['inputs']:
        register_input_events(inp)

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
