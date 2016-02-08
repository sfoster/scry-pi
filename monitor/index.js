var mqtt    = require('mqtt');
var host = process.env.MQTT_HOST || 'test.mosquitto.org';
var client  = mqtt.connect('mqtt://' + host);

var topicHandlers = {
  'button': function(message) {
    console.log('button message: ', message.toString());
  },
  'test': function(message) {
    console.log('test message: ', message.toString());
  }
};

client.on('connect', function () {
  console.log('connected on: ' + host);
  Object.keys(topicHandlers).forEach(function(topic) {
    client.subscribe(topic);
  });
});

client.on('message', function (topic, message) {
  // message is Buffer
  if (topic in topicHandlers) {
    topicHandlers[topic](message);
  } else {
    console.log('unregistered topic: ' + topic, message.toString());
  }
});
