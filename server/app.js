var express = require('express');
var app = express();
    app.use(express.static('./'));
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mysql = require('mysql');

server.listen(8080);
var connections = [];
var con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "challenge"
    });

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected database!");
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {

    socket.on('auth', function (data) {
        var username = data.msg;
        var sql = 'SELECT * FROM users WHERE username = "' + username + '"';
        con.query(sql, function (err, result) {
          if (err) throw err;
          if (result.length == 0) {
              socket.emit('auth', { valid: false });
          } else {
              connections.push(result[0].id);
              console.log(connections);
              var network_ready = connections.length > 1 ? true : false;
              socket.emit('auth', { valid: true, ready_for_connect: network_ready});
          }
        });
    });

    socket.on('message', function (data) {
      console.log(data.msg);
      socket.broadcast.emit('message', data.msg);
    });

});