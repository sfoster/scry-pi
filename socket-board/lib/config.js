'use strict'

/**
 * Module exports.
 * @public
 */

var fs = require('fs');
var path = require('path');

module.exports = function(variant) {
  console.log('config export, got variant:', variant);
  var pathname;
  switch (variant) {
    case 'production':
      pathname = path.normalize(__dirname + '/../.config-prod');
      break;
    default:
      pathname = path.normalize(__dirname + '/../.config');
  }

  var filestr = fs.readFileSync(pathname, 'utf8');
  var data = JSON.parse(filestr);

  return {
    _data: data,
    get: function(key) {
      if (!(key in data)) {
        throw new Error('No such config entry: ' + key);
      }
      // some way to do this with template strings?
      var value = data[key].replace(/\$\{[^\}]+\}/g, function(m, name) {
        return (name in data) ? data[name] :  '';
      });
      return value;
    }
  }
};
