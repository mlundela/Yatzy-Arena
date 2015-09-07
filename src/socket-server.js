var net = require('net'),
    Rx = require('rx'),
    config = require('../config'),
    commands$ = new Rx.Subject();

var botSocketMap = {};

var server = net.createServer(function (socket) {

    var id;

    socket.on('data', function (msg) {
        const command = JSON.parse(msg);
        if (command.key === 'LOGIN') {
            id = config.bots[command.secret];
            botSocketMap[id] = socket;
            console.log('Socket \'%s\' logged in!', id);
            commands$.onNext({
                bot: id,
                command: {
                    key: 'JOIN'
                }
            });
        } else {
            commands$.onNext({
                bot: id,
                command: command
            });
        }
    });

    socket.on('end', function () {
        if (id) {
            console.log('Socket connection closed (%s active sockets)', botSocketMap.length);
            delete botSocketMap[id];
            commands$.onNext({
                bot: id,
                command: {
                    key: 'QUIT'
                }
            });
        }
    });
});

server.listen(config.socketPort, function () { //'listening' listener
    console.log('server bound');
});

function send(id, msg) {
    //console.log('Send msg %s to %s', JSON.stringify(msg), JSON.stringify(id));
    botSocketMap[id].write(JSON.stringify(msg));
}

module.exports = {
    send: send,
    commands$: commands$.asObservable(),
    server: server
};