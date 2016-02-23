var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');

var express = require('express');
var app = express();

var forward = require('./lib/forward');
app.locals.config = require('./lib/config')(process.env.NODE_ENV);

/*
  TODO:
    handle api requests like:
    /watch/device_id/state
    ..and open a channel to:
    http://localhost:4001/gpio/device_id/state
    ..such that a button press produces an event on the client

    /sensor/outside_temperature.json
    ..and reverse-proxy to:
    http://localhost:4002/z-wave/device_id/temperature

    push new data:
*/


app.use(favicon(__dirname + '/client/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

if (process.env.NODE_ENV == 'development') {
  // avoid hitting 3rd party API all the time during dev
  app.get('/wunderground/api/forecast/q/:state/:city', function(req, res) {
    console.log('handling wunderground request: ', req.url);
    // send static forecast as response
    var fileName = 'wunderground_forecast.json';
    res.sendFile(fileName, {
      root: __dirname + '/client/resource'
    }, function (err) {
      if (err) {
        console.log('sendFile error', err);
        res.status(err.status).end();
      }
      else {
        console.log('Sent:', fileName);
      }
    });
  });
} else {
  // handle api requests like:
  // /wunderground/api/forecast/q/OR/Eugene.json
  // ..and reverse-proxy to:
  // http://api.wunderground.com/api/003d0486c8b1f8ab/forecast/q/OR/Eugene.json
  (function(config) {
    var wundergroundUrl = config.get('wunderground_api_url');
    console.log('wundergroundUrl: ', wundergroundUrl);
    app.use(forward(
      /\/wunderground\/(.*)/, wundergroundUrl
    ));
  })(app.locals.config);
}

app.get('/ip', function(req, res, next) {
  var ip = require('./lib/ip')();
  res.send(JSON.stringify(ip));
});

// fallback handling request as static file
app.use(express.static(path.join(__dirname, 'client')));

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// ---------------------------------------------
/// error handlers

app.use(function(err, req, res, next) {
  console.log('Error handling request for: ', req.url);
  res.status(err.status || 500);
  // TODO: better content-type-aware errors
  if (req.url.endsWith('.json')) {
    res.write({
      status: res.status,
      message: err.message
    });
  } else {
    res.write(err.message + '\n');
  }
  res.end();
});

module.exports = app;
