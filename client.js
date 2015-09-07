var net = require('net');
var config = require('./config');

var bots = {
    b1: "RW0XUSMD1X",
    b2: "pABSKahvxW"
};

var client = new net.Socket();

function send(command) {
    client.write(JSON.stringify(command));
}

var i = 1;
function threeRolls(n) {
    if (i++ % 3 == 0) {
        send({key: 'SCORE_BOX', box: n, dice: [0, 1]});
    } else {
        send({key: 'ROLL_DICE', dice: [0, 1, 2, 3, 4]});
    }
}

client.connect(config.socketPort, '127.0.0.1', function() {
    console.log('Connected');
    var login = {
        key: 'LOGIN',
        secret: bots[process.argv[2]]
    };
    client.write(JSON.stringify(login));
});

client.on('data', function(msg) {
    var game = JSON.parse(msg);
    if (game.currentPlayer.playerName === process.argv[2]) {
        console.log('%s', game.roundNumber);
        threeRolls(game.roundNumber);
    }
});

client.on('close', function() {
    console.log('Connection closed');
});