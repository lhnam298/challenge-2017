var options;

switch (process.env.NODE_ENV) {
  case 'production':
    options = {
      host : "namlh.crhlbrgm4vzq.ap-northeast-1.rds.amazonaws.com",
      user : "lhnam298",
      password : "WvCMBsQdq489h7Hb",
      database : ""
    };
    break;

  case 'stage':
    options = {
      host : "127.0.0.1",
      user : "root",
      password : "",
      database : "challenge"
    };
    break;

  case 'development':
    options = {
      host : "challenge-db",
      user : "root",
      password : "",
      database : "challenge"
    };
    break;

  default:
    options = {
      host : "127.0.0.1",
      user : "root",
      password : "",
      database : "challenge"
    };
    break;
}
exports.options = options;