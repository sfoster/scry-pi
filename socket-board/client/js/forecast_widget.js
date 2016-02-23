(function(exports) {
'use strict';

// http://www.wunderground.com/weather/api/d/docs

function ForecastWidget(options) {
  console.log('ForecastWidget ctor');
  window.Widget.call(this, options);
  console.log('/ForecastWidget ctor:', this);
}

ForecastWidget.prototype = Object.create(Widget.prototype);
ForecastWidget.prototype.constructor = ForecastWidget;

ForecastWidget.prototype.update = function() {
  console.log('Forecast widget update: ' + this.id);
  return window.fetch(this.config.url).then(function(resp) {
    return resp.json();
  }).then(function(data) {
    this.handleResponse(data);
  }.bind(this))
  .catch(function(err) {
    console.warn('Failed to update forecast with ' + url, err);
  });
};

ForecastWidget.prototype.handleResponse = function(resp) {
  this.forecast = resp.forecast.txt_forecast.forecastday[0];
};

ForecastWidget.prototype.render = function(delta) {
  delta = delta || {};
  var tmpContainer;
  if (this.firstRender) {
    tmpContainer = document.createDocumentFragment();
    this.contentNode = document.createElement('div');
    this.titleNode = document.createElement('h2');
    this.iconNode = document.createElement('p');
    this.textNode = document.createElement('p');
    tmpContainer.appendChild(this.iconNode);
    tmpContainer.appendChild(this.contentNode);
    this.contentNode.appendChild(this.titleNode);
    this.contentNode.appendChild(this.textNode);
    this.node.classList.add('forecast');
    this.iconNode.classList.add('icon', 'narrow');
  }
  this.titleNode.innerHTML = this.forecast.title;
  this.textNode.innerHTML = this.forecast.fcttext;
  this.contentNode.classList.add('content');
  this.iconNode.style.backgroundImage = 'url(' + this.forecast.icon_url + ')';

  if (this.firstRender) {
    this.node.appendChild(tmpContainer);
  }
  this.firstRender = false;
  console.log('widget render: ' + this.id, delta);
};

exports.ForecastWidget = ForecastWidget;

})(window);