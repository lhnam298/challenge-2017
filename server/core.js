var http = require('http');
var https = require('https');
var fs = require('fs');
var express = require('express');

var server;
var app = express();
app.use(express.static('dist'));

switch (process.env.NODE_ENV) {
  case 'production':
    var options = {
      key: fs.readFileSync( '/usr/src/cert/privkey1.pem' ),
      cert: fs.readFileSync( '/usr/src/cert/cert1.pem' )
    };
    server = https.createServer(options, app).listen(443);
    break;

  case 'stage':
    server = http.createServer(app).listen(8080);
    break;

  case 'development':
    server = http.createServer(app).listen(8080);
    break;

  default:
    server = http.createServer(app).listen(8080);
    break;
}

exports.server = server;
exports.app = app;
