var url = require('url'),
    WebSocketServer = require('ws').Server,
    Rx = require('rx'),
    bots = require('../application').bots,
    commands$ = new Rx.Subject();

var botSocketMap = {};

function send(id, msg){
    console.log('Send msg %s to %s', JSON.stringify(msg), JSON.stringify(id));
    botSocketMap[id].send(JSON.stringify(msg));
}

function createWSS(server) {

    var server = new WebSocketServer({server: server});

    server.on('connection', function connection(ws) {

        var id = bots[ws.upgradeReq.headers['x_yatzy_bot_token']];

        console.log('WSS: Web socket \'%s\' connected (%s active sockets)', id, server.clients.length);

        if (id) {

            botSocketMap[id] = ws;

            commands$.onNext({
                bot: id,
                command: {
                    key: "JOIN"
                }
            });

            ws.on('message', function (msg) {
                console.log('WSS: received message %s from %s: ', msg, id);
                commands$.onNext({
                    bot: id,
                    command: JSON.parse(msg)
                });
            });

            ws.on('close', function () {
                console.log('WSS: Web socket connection closed (%s active sockets)', server.clients.length);
                delete botSocketMap[id];
                commands$.onNext({
                    bot: id,
                    command: {
                        key: "QUIT"
                    }
                });
            });

        } else {
            ws.send("Authentication failed")
        }

    });

    return server;
}

module.exports = {
    send: send,
    commands$: commands$.asObservable(),
    createWSS: createWSS
};