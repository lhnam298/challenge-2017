var options;

switch (process.env.NODE_ENV) {
  case 'production':
    options = {
      host : "",
      user : "",
      password : "",
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
