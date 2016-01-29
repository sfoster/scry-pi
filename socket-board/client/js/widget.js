function Widget(type, options) {
  this.id = 'widget_' + (Widget._nextId++);
  this.type = type;
  for(var i in options) {
    this[i] = options[i];
  }
}
Widget._nextId = 0;

Widget.prototype.update = function() {
  console.log('widget update: ' + this.id);
}

Widget.prototype.render = function(data) {
  console.log('widget render: ' + this.id, data);
  this.node.innerHTML = this.id;
}