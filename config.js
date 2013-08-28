var env = process.env.NODE_ENV || 'development';

var defaults = {
  "static": {
    port: 3003
  },
  "socket": {
    options: {
      origins: '*:*',
      log: true,
      heartbeats: false,
      authorization: false,
      transports: [
        'websocket',
        'flashsocket',
        'htmlfile',
        'xhr-polling',
        'jsonp-polling'
      ],
      'log level': 1,
      'flash policy server': true,
      'flash policy port': 3013,
      'destroy upgrade': true,
      'browser client': true,
      'browser client minification': true,
      'browser client etag': true,
      'browser client gzip': false
    }
  },
  "nohm": {
    url: 'localhost',
    port: 6379,
    db: 2,
    prefix: 'admin'
  },
  "redis": {
    url: 'localhost',
    port: 6379,
    db: 2
  },
  "sessions": {
    secret: "super secret cat",
    db: 1
  }
};

module.exports = defaults;
