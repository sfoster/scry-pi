var defaultConfig = {

};

function Dashboard(options) {
  if (options) {
    for(var i in options) {
      this[i] = options[i];
    }
  }
}
Dashboard.prototype.configUrl = 'config/dashboard.json'

Dashboard.prototype.init = function() {
  var url = this.configUrl;
  var req = new Request(url);
  window.fetch(url).then(function(resp) {
    return resp.json();
  }).then(function(data) {
    this.reConfig(data);
    this.updateAndRender();
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
  this.jobs = {};

  for(var i in defaultConfig) {
    if(!(i in data)) {
      data[i] = defaultConfig[i];
    }
  }
  this.config = data.config;
  this.layout = data.layout;
  this.widgets = {};
  this.slots = {};

  var widget;
  console.log('populate for slots: ', data.layout.slots);
  for(var i=0; i<data.layout.slots.length; i++) {
    var _slot = data.layout.slots[i];
    console.log('reConfig, preparing widget for:', _slot);
    var widget = new Widget(_slot.widget, {
      // TODO: better slot / node mapping
      node: this.node.querySelector('#'+_slot.slotid),
      job: _slot.job,
      config: this.config[_slot.config]
    });
    console.log('reConfig, assigned widget:', widget);
    this.slots[_slot.slotid] = widget.id;
    this.widgets[widget.id] = widget;
  }
}

Dashboard.prototype.updateAndRender = function() {
  var names = Object.keys(this.widgets);
  var rendered = [];
  Promise.all(this.updateAllWidgets())
  .then(function(results) {
    console.log('all updated');
    var widget, result, name;
    for(var i=0; i<names.length; i++) {
      name = names[i];
      widget = this.widgets[name];
      result = results.shift();
      rendered.push(widget.render(result));
    }
    return rendered;
  }.bind(this));
}

Dashboard.prototype.updateAllWidgets = function() {
  var names = Object.keys(this.widgets);
  var widget;
  var name;
  var updated = [];
  for(var i=0; i<names.length; i++) {
    name = names[i];
    widget = this.widgets[name];
    updated.push(Promise.resolve(widget.update()));
  }
  return updated;
}
