var Engine = require('./src/game-engine'),
    ss = require('./src/socket-server');

new Engine(ss);