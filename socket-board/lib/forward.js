var request = require('request')

module.exports = function(pattern, host, args) {
  return function(req, res, next) {
    if (req.url.match(pattern)) {
      var target_path = req.url.match(pattern)[1],
          target_url = [host, target_path].join('/');
      if (args) {
        // replace placeholders
        target_url = target_url.replace(/\{([^\}]+)\}/, function(m, name) {
          return args[name] || ''
        });
      }
      req.pipe(request[req.method.toLowerCase()](target_url)).pipe(res);
    } else {
      next();
    }
  }
}