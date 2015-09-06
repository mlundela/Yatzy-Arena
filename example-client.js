var WebSocket = require('ws');

var bots = {
    b1: "RW0XUSMD1X",
    b2: "pABSKahvxW"
};

var ws = new WebSocket('ws://localhost:4080', {
    headers: {
        X_YATZY_BOT_TOKEN: bots[process.argv[2]]
    }
});

function send(command) {
    ws.send(JSON.stringify(command));
}

var i = 1;

function threeRolls(n) {

    if (i++ % 3 == 0) {
        send({key: 'SCORE_BOX', box: n, dice: [0, 1]});
    } else {
        send({key: 'ROLL_DICE', dice: [0, 1, 2, 3, 4]});
    }
}

ws.on('open', function open() {
    console.log("Connected!");
});

ws.on('message', function (msg, flags) {
    var game = JSON.parse(msg);
    if (game.currentPlayer.playerName === process.argv[2]) {
        //threeRolls();
        console.log('%s', game.roundNumber);
        threeRolls(game.roundNumber);
    }
});