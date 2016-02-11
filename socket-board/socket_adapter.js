// socket_adapter.js

var mqtt = require('mqtt');
var DEFAULT_HOST = process.env.MQTT_HOST || 'test.mosquitto.org';

var adapter = {
  nom: 'adapter',
  handlers: {
    'sensors/button_1': function(message) {
      console.log('adapter: button_1 message: ', message.toString());
      if (this.emitter) {
        this.emitter.emit('gpio/button', {
          button_id: 'button_1',
          detail: message.toString()
        });
      } else {
        console.log('no emitter to relay button_1 event');
      }
    },
   'test': function(message) {
      console.log('test message: ', message.toString());
    },
  },
  connect: function(opts) {
    opts = opts || {};
    this.emitter = opts.emitter;
    console.log('socket_adapter: connect got emitter:', this.emitter);
    var host = opts.host || DEFAULT_HOST;
    var client = this.client = mqtt.connect('mqtt://' + host);
    var topics = Object.keys(this.handlers);

    client.on('connect', function () {
      console.log('connected on: ' + host);
      client.unsubscribe(topics);
      client.subscribe(topics);
    });

    client.on('message', function (topic, message) {
      // message is Buffer
      if (typeof this.handlers[topic] === 'function') {
        this.handlers[topic].call(this, message);
      } else {
        console.log('unregistered topic: ' + topic, message.toString());
      }
    }.bind(this));
  }
};

module.exports = adapter;
