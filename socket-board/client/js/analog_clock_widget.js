(function(exports) {
'use strict';

function AnalogClockWidget(options) {
  window.Widget.call(this, options);
}

AnalogClockWidget.prototype = Object.create(Widget.prototype);
AnalogClockWidget.prototype.constructor = AnalogClockWidget;

AnalogClockWidget.prototype.DEBUG = false;

AnalogClockWidget.prototype.update = function() {
};

AnalogClockWidget.prototype.render = function(data) {
  if (this.firstRender) {
    this.canvasNode = document.createElement('canvas');
    this.canvasNode.dataset.skin = 'chunkySwissOnBlack';
    this.canvasNode.dataset.radius = '150';
    this.node.appendChild(this.canvasNode);
    CoolClock && CoolClock.createClock(this.canvasNode)
  }
  this.DEBUG && console.log('widget render: ' + this.id, data);
  this.firstRender = false;
};

exports.AnalogClockWidget = AnalogClockWidget;

})(window);