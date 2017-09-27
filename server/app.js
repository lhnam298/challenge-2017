var db = require('./database');
var core = require('./core');
var socket = require('socket.io');
var Promise = require('promise');

var con = db.con;
var server = core.server;
var app = core.app;
var io = socket(server);

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
            return Promise.resolve(data);

        }).then(function(data) {
            var sql = 'SELECT ??, ??, ??, ?? FROM ?? WHERE ?? = ? AND ?? = ? AND ?? = ? AND ?? != ?';
            con.query(sql, ['socket_id', 'username', 'status', 'avatar_url', 'users', 'room', data.room, 'login_status', 1, 'del_flg', 0, 'id', data.id], function (err, result) {

                if (err) throw err;

                peers = [];
                for (var i=0;  i<result.length; i++) {
                    peers.push({
                        'sid': result[i].socket_id,
                        'username': result[i].username,
                        'status': result[i].status,
                        'avatar': result[i].avatar_url
                    });
                }

                socket.emit('auth', {
                    valid: true,
                    usable: true,
                    uid: data.id,
                    username: data.username,
                    status: data.status,
                    avatar: data.avatar_url,
                    room: data.room,
                    connectable: io.sockets.adapter.rooms[data.room].length > 1 ? true : false,
                    peers: peers
                });
            });

        }).catch();

    });

    socket.on('message', function (data) {
        socket.to(data.to).emit('message', { from: socket.id, username: data.username, status: data.status, content: data.msg });
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