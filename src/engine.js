//var Rx = require('rx');
var _ = require('lodash');

function Engine(wss) {

    var bots = [];
    var game;

    function roll(dice, selected) {
        var out = dice;
        for (var i = 0; i < dice.length; i++) {
            if (_.includes(selected, i)) {
                out[i] = Math.floor(Math.random() * 6) + 1;
            }
        }
        return out;
    }

    function rollAll() {
        return roll([1, 1, 1, 1, 1], [0, 1, 2, 3, 4]);
    }

    function createGame() {
        var players = _.shuffle(bots);
        return {
            key: "STANDING",
            roundNumber: 1,
            standing: players.map(function (b) {
                return {
                    playerName: b,
                    score: ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-']
                }
            }),
            currentPlayer: {
                index: 0,
                playerName: players[0],
                rollsLeft: 2,
                dice: rollAll()
            }
        };
    }

    wss.commands$.subscribe(function (d) {
        switch (d.command.key) {
            case 'JOIN':
                bots.push(d.bot);
                if (!game) {
                    game = createGame();
                    wss.send(game.currentPlayer.playerName, game);
                }
                break;

            case 'QUIT':
                bots.splice(bots.indexOf(d.bot), 1);
                if (bots.length === 0) {
                    game = null;
                }
                break;

            case 'ROLL_DICE':
                if (d.bot !== game.currentPlayer.playerName) {
                    console.log('Not your turn %s!', d.bot);
                } else if (game.currentPlayer.rollsLeft > 0) {
                    game.currentPlayer.rollsLeft -= 1;
                    game.currentPlayer.dice = roll(game.currentPlayer.dice, d.command.dice);
                    wss.send(game.currentPlayer.playerName, game);
                } else {
                    console.warn('Illegal command %s from %s', d.command.key, d.bot);
                    // todo ???
                }
                break;

            case 'SCORE_BOX':

                if (d.bot !== game.currentPlayer.playerName) {
                    console.log('Not your turn %s!', d.bot);
                } else if (game.standing[game.currentPlayer.index].score[d.command.box] === '-') {

                    // todo validate dice
                    
                    game.standing[game.currentPlayer.index].score[d.command.box] =
                        _.sum(game.currentPlayer.dice.filter(function (die) {
                            return die in d.command.dice;
                        }));

                    var idx = (game.currentPlayer.index + 1) % game.standing.length;
                    game.currentPlayer = {
                        index: idx,
                        playerName: game.standing[idx].playerName,
                        rollsLeft: 2,
                        dice: rollAll()
                    };

                    // todo in case game ends, update ratings and archive game, start a new game

                    wss.send(game.currentPlayer.playerName, game);

                } else {
                    console.warn('Illegal command %s from %s', d.command.key, d.bot);
                    // todo ???
                }

                break;

            default:
                console.console.log('Unknown command: ', d.command.key);
                break;
        }
    })

}

module.exports = Engine;