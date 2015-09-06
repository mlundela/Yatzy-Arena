var server = require('http').createServer(),
    wss = require('./src/wss'),
    config = require('./application');

wss.createWSS(server);

server.listen(config.port, function () {
    console.log('Listening on ' + server.address().port);
});