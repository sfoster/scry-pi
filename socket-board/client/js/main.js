// get config,
// instantiate widget and backing jobs
// populate each slot

document.addEventListener('DOMContentLoaded', function(event) {
  console.log('main: init dashboard');
  window.dashboard = new Dashboard({
    node: document.getElementById('wrapper')
  });
  window.dashboard.init();

  var socket = io(location.origin, {
    // reconnection: true,
    // reconnectionDelay: 1000,
    // reconnectionDelayMax: 5000
    // timeout: 20000
  });
  socket.on('connect', function(evt) {
    console.log('onconnect: ', socket.id);
    socket.emit('client/ready', {
      id: socket.id,
      origin: location.origin
    });
  });
  socket.on('gpio/button', function (data) {
    console.log('got button event', data);
    var btnEvent = new CustomEvent('hardbuttonup', {
      detail: {
        foo: 'Foo'
      }
    });
    window.dispatchEvent(btnEvent);
  });

  window.addEventListener('hardbuttonup', function() {
    var node = document.body;
    node.classList.add('glow');
    setTimeout(function() {
      node.classList.remove('glow');
    }, 300)
  });
});