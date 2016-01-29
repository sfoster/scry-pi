(function(exports) {
'use strict';

function ImageWidget(options) {
  console.log('ImageWidget ctor');
  window.Widget.call(this, options);
  console.log('/ImageWidget ctor:', this);
}

ImageWidget.prototype = Object.create(Widget.prototype);
ImageWidget.prototype.constructor = ImageWidget;

ImageWidget.prototype.update = function() {
};

ImageWidget.prototype.render = function(delta) {
  delta = delta || {};
  if (this.firstRender) {
    var container = document.createDocumentFragment();
    var img = this.imageNode = document.createElement('img');
    img.classList.add('loading');
    img.id = this.id + '-image';
    container.appendChild(img);
    var title = this.titleNode = document.createElement('h2');
  }
  console.log('widget render: ' + this.id, delta);
  var img = this.imageNode;
  if (!this.config || !this.config.url) {
    console.warn(this.id + ': no config.url');
  }
  if (this.firstRender ||
      delta.src || img.src !== this.config.url) {
    img.src = this.config.url;
    img.onload = function() {
      img.classList.remove('loading');
    }
  }
  if (this.firstRender || delta.widgetTitle) {
    this.titleNode.innerHTML = this.widgetTitle;
  }
  if (this.firstRender) {
    this.node.appendChild(container);
  }
  this.firstRender = false;
};

exports.ImageWidget = ImageWidget;
})(window);