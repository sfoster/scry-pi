#!/usr/bin/env python
import os, subprocess
import paho.mqtt.client as paho
import simplejson as json

mqtt_host = os.environ.get('MQTT_HOST', '127.0.0.1')
mqtt_port = os.environ.get('MQTT_PORT', '1883')
config_file = os.path.join(os.path.dirname(__file__), 'config.json')

io_config = { 'prefix': '/', 'inputs': [], 'outputs': [] }

if os.path.isfile(config_file):
    with open(config_file) as data_file:
        data = json.load(data_file)
        if 'prefix' in data:
            io_config['prefix'] = data['prefix']


def on_connect(pahoClient, obj, rc):
    # Once connected, hook into i/o events
    os.environ['DISPLAY'] = ":0"
    client.subscribe(io_config['prefix'] + 'buttonup')
    client.subscribe(io_config['prefix'] + 'inrange')

def on_message(client, userdata, msg):
    # xset dpms force on
    subprocess.call('xset dpms force on', shell=True)

client = paho.Client()

# Register callbacks
client.on_connect = on_connect
client.on_message = on_message

# connect and loop
client.connect(mqtt_host, mqtt_port)
client.loop_forever()


