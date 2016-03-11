(function(exports) {
'use strict';

var utils = {};

var unitValues = {
  s: 1,
  m: 60,
  h: 3600
};
unitValues.d = 24 * unitValues.h;
unitValues.w = 7 * unitValues.d;
unitValues.mth = 4 * unitValues.w;
unitValues.y = 12 * unitValues.mth;

utils.getMillisFromTimeString = function(str) {
  // inputs like: 4d 6hr, 12s, 5min
  if (typeof str !== 'string') {
    // early return as-is for non-string values,
    return +str;
  }
  str = str.toLowerCase().replace(/[^\.\w+-]+/g, '');
  var totalMillis = 0;
  var regex = /([-+]?)([0-9\.]+)([a-z]+)/g;
  var group, sign, unit, value;
  while ((group = regex.exec(str))) {
    sign = group[1] || '+';
    value = group[2];
    unit = group[3];
    switch (unit) {
      case 'd':
      case 'day':
      case 'days':
        totalMillis += 1000 * unitValues.d * Number(sign +'' + value);
        break;
      case 'h':
      case 'hr':
      case 'hour':
      case 'hours':
        totalMillis += 1000 * unitValues.h * Number(sign +'' + value);
        break;
      case 'm':
      case 'min':
      case 'mins':
        totalMillis += 1000 * unitValues.m * Number(sign +'' + value);
        break;
      case 's':
      case 'sec':
      case 'secs':
        totalMillis += 1000 * unitValues.s * Number(sign +'' + value);
        break;
      case 'ms':
      case 'millis':
        totalMillis += Number(sign +'' + value);
        break;
    }
  }
  return totalMillis;
};

exports.utils = utils;
})(window)