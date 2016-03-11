(function(exports) {
'use strict';

var defaultConfig = {};

function Dashboard(options) {
  if (options) {
    for(var i in options) {
      this[i] = options[i];
    }
  }
  this.intervals = {};
}
Dashboard.prototype.configUrl = 'config/dashboard.json'

Dashboard.prototype.init = function() {
  var url = this.configUrl;
  var req = new Request(url);
  window.fetch(url).then(function(resp) {
    return resp.json();
  }).then(function(data) {
    this.reConfig(data);
    this.initialUpdateAndRender();
  }.bind(this))
  .catch(function(err) {
    console.warn('Failed to init with ' + url, err);
  });
}

Dashboard.prototype.reConfig = function(data) {
  console.log('reConfig, got data:', data);
  data = data || {};
  // TODO: teardown
  this.widgets = {};

  for(var i in defaultConfig) {
    if(!(i in data)) {
      data[i] = defaultConfig[i];
    }
  }
  this.config = data.config;
  this.layout = data.layout;
  this.widgets = {};
  this.slots = {};

  var widget, _slot, widgetConfig;
  console.log('populate for slots: ', data.layout.slots);
  for(var i=0; i<data.layout.slots.length; i++) {
    _slot = data.layout.slots[i];
    widgetConfig = this.config[_slot.config] || {};
    console.log('reConfig, preparing widget for:', _slot);
    widget = Widget.createWidget(_slot.widget, {
      // TODO: better slot / node mapping
      node: this.node.querySelector('#'+_slot.slotid),
      config: widgetConfig
    });
    console.log('reConfig, assigned widget:', widget);
    this.slots[_slot.slotid] = widget.id;
    this.widgets[widget.id] = widget;
  }
}

Dashboard.prototype.prepareIntervals = function() {
  var widget;
  var itv;
  var minInterval = 16;
  this.intervals = {};
  for(var id in this.widgets) {
    widget = this.widgets[id];
    if (widget.config.interval) {
      itv = utils.getMillisFromTimeString(widget.config.interval);
      if (!isNaN(itv) && itv >= minInterval) {
        if (!this.intervals[itv]) {
          this.intervals[itv] = [];
        }
        this.intervals[itv].push(id);
      } else {
        console.warn('Ignoring invalid interval: ', id, widget.config.interval, itv);
      }
    }
  }
  Object.keys(this.intervals).forEach(function(itv) {
    console.log('start timer for interval: ', itv);
    var timer = setInterval(this.onInterval.bind(this, itv), itv);
    this.intervals[itv].timer = timer;
  }, this);
};

Dashboard.prototype.onInterval = function(itv) {
  var ids = this.intervals[itv];
  var updated;
  if (ids && ids.length) {
    this.updateAndRender(ids);
  }
};

Dashboard.prototype.stop = function() {
  var timer, itv;
  for(itv in this.intervals) {
    timer = this.intervals[itv].timer;
    console.log('stop: ', itv, timer);
    timer && clearInterval(timer);
  }
};

Dashboard.prototype.initialUpdateAndRender = function() {
  this.prepareIntervals();
  this.updateAndRender();
};

Dashboard.prototype.updateAndRender = function(ids) {
  ids = ids || Object.keys(this.widgets);
  var rendered = [];

  Promise.all(this.updateWidgets(ids))
  .then(function(results) {
    var widget, result, name;
    for(var i=0; i<ids.length; i++) {
      name = ids[i];
      widget = this.widgets[name];
      result = results.shift();
      rendered.push(widget.render(result));
    }
    return rendered;
  }.bind(this));
}

Dashboard.prototype.updateWidgets = function(ids) {
  ids = ids || Object.keys(this.widgets);
  var widget;
  var name;
  var updated = [];
  for(var i=0; i<ids.length; i++) {
    name = ids[i];
    widget = this.widgets[name];
    updated.push(Promise.resolve(widget.update()));
  }
  return updated;
}

exports.Dashboard = Dashboard;

})(window);
