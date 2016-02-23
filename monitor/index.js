var mqtt    = require('mqtt');
var host = process.env.MQTT_HOST || 'test.mosquitto.org';
var client  = mqtt.connect('mqtt://' + host);

var topicHandlers = {
  'sensors/buttonup': function(message) {
    console.log('sensors/buttonup message: ', message.toString());
  },
  'sensors/inrange': function(message) {
    console.log('sensors/inrange message: ', message.toString());
  },
  'test': function(message) {
    console.log('test message: ', message.toString());
  }
};

client.on('connect', function () {
  console.log('connected on: ' + host);
  client.subscribe(Object.keys(topicHandlers));
});

client.on('message', function (topic, message) {
  // message is Buffer
  if (topic in topicHandlers) {
    topicHandlers[topic](message);
  } else {
    console.log('unregistered topic: ' + topic, message.toString());
  }
});
