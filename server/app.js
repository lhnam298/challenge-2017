var database = require('./database');
var core = require('./core');
var socket = require('socket.io');
var mysql = require('mysql');
var Promise = require('promise');

var server = core.server;
var app = core.app;
var io = socket(server);
var options = database.options;
var connection;

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {

    socket.emit('welcome', { sid: socket.id });

    socket.on('auth', function (data) {

        pool = mysql.createPool(options);
        pool.getConnection(function(err, connection) {
            if (err) throw err;
            return new Promise((resolve, reject) => {
                var sql = 'SELECT * FROM ?? WHERE ?? = ? AND ?? = ?';
                connection.query(sql, ['users', 'lid', data.lid, 'del_flg', 0], function (err, result) {
                    if (err) return reject(err);

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
            }).then((data) => {
                return new Promise((resolve, reject) => {
                    socket.join(data.room, () => {
                        connection.beginTransaction(function(err) {
                            if (err) return reject(err);

                            var sql = 'UPDATE ?? SET ?? = ?, ?? = ? WHERE ?? = ?';
                            connection.query(sql, ['users', 'socket_id', socket.id, 'login_status', 1, 'id', data.id], function (err, result) {
                                if (err) {
                                    return connection.rollback(function() {
                                        return reject(err);
                                    });
                                }

                                connection.commit(function(err) {
                                    if (err) {
                                        return connection.rollback(function() {
                                            return reject(err);
                                        });
                                    }
                                    resolve(data);
                                });

                            });
                        });
                    });
                })

            }).then((data) => {
                return new Promise((resolve, reject) => {
                    var sql = 'SELECT ??, ??, ??, ?? FROM ?? WHERE ?? = ? AND ?? = ? AND ?? = ? AND ?? != ?';
                    connection.query(sql, ['socket_id', 'username', 'status', 'avatar_url', 'users', 'room', data.room, 'login_status', 1, 'del_flg', 0, 'id', data.id], function (err, result) {

                        if (err) return reject(err);

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

                        resolve();
                    });
                })

            }).then(() => {
                return new Promise((resolve, reject) => {
                        connection.release();
                        resolve();
                    });
            }).catch((err) => {
                throw err;
            });
        });

    });

    socket.on('message', function (data) {
        socket.to(data.to).emit('message', { from: socket.id, username: data.username, status: data.status, avatar: data.avatar, content: data.msg });
    });

    socket.on('disconnect', (reason) => {
        pool = mysql.createPool(options);
        pool.getConnection(function(err, connection) {
            if (err) throw err;
            return new Promise((resolve, reject) => {
                var sql = 'SELECT ?? FROM ?? WHERE ?? = ? AND ?? = ?';
                connection.query(sql, ['id', 'users', 'socket_id', socket.id, 'login_status', 1], function (err, result) {
                    if (err) return reject(err);

                    if (result.length == 0) resolve();

                    connection.beginTransaction(function(err) {
                        if (err) return reject(err);

                        var sql = 'UPDATE ?? SET ?? = ?, ?? = ? WHERE ?? = ?';
                        connection.query(sql, ['users', 'socket_id', null, 'login_status', 0, 'socket_id', socket.id], function (err, result) {
                            if (err) {
                                return connection.rollback(function() {
                                    return reject(err);
                                });
                            }

                            connection.commit(function(err) {
                                if (err) {
                                    return connection.rollback(function() {
                                        return reject(err);
                                    });
                                }
                                resolve();
                            });
                        });
                    });
                });

            }).then(() => {
                return new Promise((resolve, reject) => {
                    connection.release();
                    resolve();
                });
            }).catch((err) => {
                throw err;
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
