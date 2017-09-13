var express = require('express');
var app = express();
    app.use(express.static('./'));
    app.use(express.static('./dist/'));
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mysql = require('mysql');
var Promise = require('promise');

server.listen(8080);

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

    socket.emit('welcome', { sid: socket.id });

    socket.on('auth', function (data) {

        var lid = data.lid;
        return new Promise((resolve, reject) => {
            var sql = 'SELECT * FROM ?? WHERE ?? = ? AND ?? = ?';
            con.query(sql, ['users', 'lid', lid, 'del_flg', 0], function (err, result) {
                if (err) throw err;

                if (result.length == 0) {
                    socket.emit('auth', {
                        valid: false
                    });

                } else if (result[0].login_status != 0 && result[0].socket_id != null) {
                    socket.emit('auth', {
                        valid: true,
                        usable: false
                    });

                } else {
                    resolve(result[0]);
                }
            });

        }).then(function(data) {
            socket.join(data.room, () => {
                var sql = 'UPDATE ?? SET ?? = ?, ?? = ? WHERE ?? = ?';
                con.query(sql, ['users', 'socket_id', socket.id, 'login_status', 1, 'id', data.id], function (err, result) {
                    if (err) {
                        return con.rollback(function() {
                            throw err;
                        });
                    }
                });
            });
            return data;

        }).then(function(data) {
//            var sql = 'SELECT ??, ??, ?? FROM ?? WHERE ?? = ? AND ?? = ? AND ?? = ? AND ?? != ?';
//            con.query(sql, ['socket_id', 'username', 'status', 'users', 'room', data.room, 'login_status', 1, 'del_flg', 0, 'id', data.id], function (err, result) {
              var sql = 'SELECT ?? FROM ?? WHERE ?? = ? AND ?? = ? AND ?? = ? AND ?? != ?';
              con.query(sql, ['socket_id', 'users', 'room', data.room, 'login_status', 1, 'del_flg', 0, 'id', data.id], function (err, result) {
                if (err) throw err;

                peers = [];
                for (var i=0;  i<result.length; i++) {
                  peers.push(result[i].socket_id);
//                    peers.push({
//                        'sid': result[i].socket_id,
//                        'username': result[i].username,
//                        'status': result[i].status
//                    });
                }

                socket.emit('auth', {
                    valid: true,
                    usable: true,
                    uid: data.id,
                    username: data.username,
                    status: data.status,
                    room: data.room,
                    connectable: io.sockets.adapter.rooms[data.room].length > 1 ? true : false,
                    peers: peers
                });
            });

        }).catch();

    });

    socket.on('message', function (data) {
      console.log(data);
        socket.to(data.to).emit('message', { from: socket.id, content: data.msg });
    });

    socket.on('disconnect', (reason) => {
        var sql = 'SELECT ?? FROM ?? WHERE ?? = ? AND ?? = ?';
        con.query(sql, ['id', 'users', 'socket_id', socket.id, 'login_status', 1], function (err, result) {
            if (err) throw err;

            if (result.length == 0) return;

            var sql = 'UPDATE ?? SET ?? = ?, ?? = ? WHERE ?? = ?';
            con.query(sql, ['users', 'socket_id', null, 'login_status', 0, 'socket_id', socket.id], function (err, result) {
                if (err) {
                    return con.rollback(function() {
                        throw err;
                    });
                }
            });
        });
    });

    socket.on('disconnecting', (reason) => {
        let rooms = Object.keys(socket.rooms);
        console.log(rooms);
        socket.to(rooms[0]).emit('leave', {
            sid: socket.id
        });
    });
});