// socket_adapter.js

var mqtt = require('mqtt');
var DEFAULT_HOST = process.env.MQTT_HOST || 'test.mosquitto.org';

var adapter = {
  nom: 'adapter',
  handlers: {
    'sensors/buttonup': function(message) {
      message = message.toString();
      console.log('adapter: buttonup message: ', message);
      var id = message.split(':')[0];
      if (this.socketEmit) {
        console.log('emit message: gpio/button');
        this.socketEmit('gpio/button', {
          input_id: id,
          detail: message
        });
      } else {
        console.log('no emitter to relay button_1 event');
      }
    },
    'sensors/inrange': function(message) {
      message = message.toString();
      console.log('adapter: inrange message: ', message);
      var id = message.split(':')[0];
      if (this.socketEmit) {
        this.socketEmit('gpio/rangechange', {
          input_id: id,
          detail: message
        });
      } else {
        console.log('no emitter to relay  event');
      }
    },
   'test': function(message) {
      console.log('test message: ', message.toString());
    },
  },
  connect: function(opts) {
    opts = opts || {};
    console.log('socket_adapter: connect');
    var host = opts.host || DEFAULT_HOST;
    var mqttClient = this.mqttClient = mqtt.connect('mqtt://' + host);
    var topics = Object.keys(this.handlers);
    this.socketEmit = opts.emit;

    mqttClient.on('connect', function () {
      console.log('connected on: ' + host, 'subscribing to topics: ' + topics.join(','));
      mqttClient.unsubscribe(topics);
      mqttClient.subscribe(topics);
    });

    mqttClient.on('message', function (topic, message) {
      // message is Buffer
      console.log('adapter: got message on topic:', topic, message);
      if (typeof this.handlers[topic] === 'function') {
        this.handlers[topic].call(this, message);
      } else {
        console.log('unregistered topic: ' + topic, message.toString());
      }
    }.bind(this));
  }
};

module.exports = adapter;
