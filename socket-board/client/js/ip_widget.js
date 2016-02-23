(function(exports) {
'use strict';

function IpWidget(options) {
  console.log('IpWidget ctor');
  this.bestIP = { name: '-', address: '-'};
  window.Widget.call(this, options);
}

IpWidget.prototype = Object.create(Widget.prototype);
IpWidget.prototype.constructor = IpWidget;

IpWidget.prototype.update = function() {
  var url = this.config.url;
  console.log('IP widget update: ' + this.id, url);
  return window.fetch(this.config.url).then(function(resp) {
    return resp.json();
  }).then(function(data) {
    this.handleResponse(data);
  }.bind(this))
  .catch(function(err) {
    console.warn('Failed to update IP with ' + url, err);
  });
};

IpWidget.prototype.handleResponse = function(resp) {
  console.log('IpWidget handleResponse: ', resp);
  this.ips = resp;
  if (this.ips.length) {
    this.bestIP = this.ips[0]; // TODO: some heuristic to pick the most useful?
  }
};

IpWidget.prototype.render = function(delta) {
  var tmpContainer;
  if (this.firstRender) {
    tmpContainer = document.createDocumentFragment();
    this.titleNode = document.createElement('h2');
    this.textNode = document.createElement('p');
    tmpContainer.appendChild(this.titleNode);
    tmpContainer.appendChild(this.textNode);
    this.node.classList.add('ipaddress');
    this.titleNode.classList.add('narrow');
  }
  console.log('IpWidget render, bestIP:', this.bestIP);
  this.titleNode.textContent = this.bestIP.name;
  this.textNode.textContent = this.bestIP.address;

  if (this.firstRender) {
    this.node.appendChild(tmpContainer);
  }
  this.firstRender = false;
  console.log('widget render: ' + this.id, this.bestIP);
};

exports.IpWidget = IpWidget;

})(window);