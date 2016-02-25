(function(exports) {
'use strict';

function Widget(options) {
  this.id = 'widget_' + (Widget._nextId++);
  for(var i in options) {
    this[i] = options[i];
  }
  // TODO: set up binding to get data from the job
  // render: just render what data we have
  // update: either sample from ongoing data, or trigger a new request
}

Widget._nextId = 0;
Widget.createWidget = function(type, options) {
  // use require.js or similar to lazy load?
  var ctorName = type.replace(/(^|_)([a-z0-9])/g, function(m, n, b) {
    return b.toUpperCase();
  });
  var Ctor = window[ctorName + 'Widget'];
  options.type = type;

  if (typeof Ctor === 'function') {
    return new Ctor(options);
  } else {
    console.log('Widget type "' + ctorName + '" not defined, falling back to Widget');
    return new Widget(options);
  }
};

Widget.prototype.widgetType = 'Generic';
Widget.prototype.firstRender = true;

Widget.prototype.update = function() {
  console.log('widget update: ' + this.id);
};

Widget.prototype.render = function(data) {
  console.log('widget render: ' + this.id, data);
  this.node.innerHTML = this.id;
};

exports.Widget = Widget;

})(window);
