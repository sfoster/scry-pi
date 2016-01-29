(function(exports) {
'use strict';

function ClockWidget(options) {
  window.Widget.call(this, options);
}

ClockWidget.prototype = Object.create(Widget.prototype);
ClockWidget.prototype.constructor = ClockWidget;

ClockWidget.prototype.update = function() {
  var now = new Date();
  this.time = now.toLocaleTimeString();
  this.date = now.toLocaleDateString();
  console.log('Clock widget update: ' + this.id);
};

ClockWidget.prototype.render = function(data) {
  if (this.firstRender) {
    this.timeNode = document.createElement('p');
    this.timeNode.classList.add('time');
    this.dateNode = document.createElement('p');
    this.dateNode.classList.add('date');
    this.node.classList.add('clock');
    this.node.appendChild(this.dateNode);
    this.node.appendChild(this.timeNode);
  }
  console.log('widget render: ' + this.id, data);
  this.timeNode.innerHTML = this.time;
  this.dateNode.innerHTML = this.date;
  this.firstRender = false;
};

exports.ClockWidget = ClockWidget;

})(window);