var mysql = require('mysql');
var con;

switch (process.env.NODE_ENV) {
  case 'production':
    con = mysql.createConnection({
      host : "namlh.crhlbrgm4vzq.ap-northeast-1.rds.amazonaws.com",
      user : "lhnam298",
      password : "WvCMBsQdq489h7Hb",
      database : ""
    });
    break;

  case 'stage':
    con = mysql.createConnection({
      host : "127.0.0.1",
      user : "root",
      password : "",
      database : "challenge"
    });
    break;

  case 'development':
    con = mysql.createConnection({
      host : "challenge-db",
      user : "root",
      password : "",
      database : "challenge"
    });
    break;

  default:
    con = mysql.createConnection({
      host : "127.0.0.1",
      user : "root",
      password : "",
      database : "challenge"
    });
    break;
}

exports.con = con;