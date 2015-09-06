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

    function diceValues(cmd) {
        return cmd.dice.map(function (idx) {
            return game.currentPlayer.dice[idx];
        });
    }

    function validateScoreCommand(cmd) {

        const n = cmd.box;
        const dice = diceValues(cmd);

        switch (n) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
                return _.every(dice, n);

            case 7: // One pair
                return dice.length === 2 &&
                    _.uniq(dice).length === 1;

            case 8: // Two pairs
                return dice.length === 4 &&
                    _.uniq(dice).length === 2 &&
                    _.every(_.groupBy(dice), function (p) {
                        return p.length === 2;
                    });

            case 9: // Three of a Kind: Three dice showing the same number. Score: Sum of those three dice.
                return dice.length === 3 &&
                    _.uniq(dice).length === 1;

            case 10: // Four of a Kind: Four dice with the same number. Score: Sum of those four dice.
                return dice.length === 4 &&
                    _.uniq(dice).length === 1;

            case 11: // Small Straight: The combination 1-2-3-4-5. Score: 15 points (sum of all the dice).
                return dice.length === 5 &&
                    _.uniq(dice).length === 5 &&
                    _.sum(dice) === 15;

            case 12: // Large Straight: The combination 2-3-4-5-6. Score: 20 points (sum of all the dice).
                return dice.length === 5 &&
                    _.uniq(dice).length === 5 &&
                    _.sum(dice) === 20;

            case 13: // Full House: Any set of three combined with a different pair. Score: Sum of all the dice.
                return dice.length === 5 &&
                    _.uniq(dice).length === 2 &&
                    _.every(_.groupBy(dice), function (p) {
                        return p.length === 2 || p.length === 3;
                    });

            case 14: // Chance: Any combination of dice. Score: Sum of all the dice.
                return dice.length === 5;

            case 15: // Yatzy: All five dice with the same number. Score: 50 points.
                return dice.length === 5 &&
                    _.uniq(dice).length === 1;

            default:
                return false;
        }

    }

    function scoreBox(cmd) {
        if (!validateScoreCommand(cmd)) {
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
                    break;
                }

                if (validateRollCommand()) {
                    game.currentPlayer.rollsLeft -= 1;
                    game.currentPlayer.dice = roll(game.currentPlayer.dice, d.command.dice);
                    wss.send(game.currentPlayer.playerName, game);
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

                if (game.standing[game.currentPlayer.index].score[d.command.box - 1] !== '-') {
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
                    game = createGame();
                    wss.send(game.currentPlayer.playerName, game);
                } else {
                    game.currentPlayer = {
                        index: nextIdx,
                        playerName: game.standing[nextIdx].playerName,
                        rollsLeft: 2,
                        dice: rollAll()
                    };
                    wss.send(game.currentPlayer.playerName, game);
                }
                break;

            default:
                console.console.log('Unknown command: ', d.command.key);
                break;
        }
    })

}

module.exports = Engine;