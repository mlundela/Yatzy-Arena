var _ = require('lodash');
var utils = require('./game-utils');

function Engine(socketServer) {

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
        return roll(_.range(5), _.range(5));
    }

    function createGame() {
        console.log('ENGINE: Create new game with %s players', bots.length);
        var players = _.shuffle(bots);
        return {
            key: "STANDING",
            roundNumber: 1,
            standing: players.map(function (b) {
                return {
                    playerName: b,
                    score: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
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

    function diceValues(cmd) {
        return cmd.dice.map(function (idx) {
            return game.currentPlayer.dice[idx];
        });
    }

    function scoreBox(cmd) {
        if (!utils.validateScoreCommand(cmd.box, diceValues(cmd))) {
            return 0;
        }
        if (cmd.box === 15) {
            return 50;
        }
        return _.sum(diceValues(cmd));
    }

    function validateRollCommand() {
        return game.currentPlayer.rollsLeft > 0;
    }

    function gameEnds() {
        return game.roundNumber > 15;
    }

    function startNewGame() {
        game = createGame();
        socketServer.send(game.currentPlayer.playerName, game);
    }

    socketServer.commands$.subscribe(function (d) {

        switch (d.command.key) {
            case 'JOIN':
                bots.push(d.bot);
                if (!game) {
                    startNewGame();
                }
                break;

            case 'QUIT':
                bots.splice(bots.indexOf(d.bot), 1);
                if (bots.length === 0) {
                    game = null;
                } else {
                    startNewGame();
                }
                break;

            case 'ROLL_DICE':

                if (d.bot !== game.currentPlayer.playerName) {
                    console.log('Not your turn %s!', d.bot);
                    break;
                }

                if (validateRollCommand()) {
                    game.currentPlayer.rollsLeft -= 1;
                    game.currentPlayer.dice = roll(game.currentPlayer.dice, d.command.dice);
                    socketServer.send(game.currentPlayer.playerName, game);
                } else {
                    console.warn('Illegal command %s from %s (no more rolls left)', d.command.key, d.bot);
                    // todo ???
                }
                break;

            case 'SCORE_BOX':

                if (d.bot !== game.currentPlayer.playerName) {
                    console.log('Not your turn %s!', d.bot);
                    break;
                }

                if (game.standing[game.currentPlayer.index].score[d.command.box - 1] >= 0) {
                    console.log('Illegal command %s from %s (score box is already used)', d.command.key, d.bot);
                    // todo ???
                    break;
                }

                var nextIdx = (game.currentPlayer.index + 1) % game.standing.length;
                game.standing[game.currentPlayer.index].score[d.command.box - 1] = scoreBox(d.command);
                game.roundNumber += nextIdx === 0 ? 1 : 0;

                if (gameEnds()) {
                    // todo update ratings and archive game
                    var scores = game.standing.map(function (bot) {
                        return {
                            bot: bot.playerName,
                            score: _.sum(bot.score)
                        }
                    });
                    var scoreBoard = _.sortByOrder(scores, 'score', 'desc');
                    console.log('Final scoreboard: ', scoreBoard);
                    startNewGame();
                } else {
                    game.currentPlayer = {
                        index: nextIdx,
                        playerName: game.standing[nextIdx].playerName,
                        rollsLeft: 2,
                        dice: rollAll()
                    };
                    socketServer.send(game.currentPlayer.playerName, game);
                }
                break;

            default:
                console.console.log('Unknown command: ', d.command.key);
                break;
        }
    })

}

module.exports = Engine;