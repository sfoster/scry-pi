/*!
 * config
 */

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
  return JSON.parse(filestr);
};
