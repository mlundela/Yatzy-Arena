var url = require('url'),
    WebSocketServer = require('ws').Server;

function createWSS(server) {

    var wss = new WebSocketServer({server: server});

    wss.on('connection', function connection(ws) {
        //var location = url.parse(ws.upgradeReq.url, true);
        // you might use location.query.access_token to authenticate or share sessions
        // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

        ws.on('message', function incoming(message) {
            console.log('received: %s', message);
            ws.send(message);
        });

        ws.send('something');
    });

    return wss;
}

module.exports = {
    createWSS: createWSS
};
