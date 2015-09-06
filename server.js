var server = require('http').createServer(),
    wss = require('./src/wss'),
    config = require('./application'),
    Engine = require('./src/engine');

wss.createWSS(server);

// Start engine!
var engine = new Engine(wss);

server.listen(config.port, function () {
    console.log('Listening on ' + server.address().port);
});