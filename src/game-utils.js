var _ = require('lodash');

function validateScoreCommand(n, dice) {

    switch (n) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
            return dice.length > 0 &&
                _.every(dice, function (x) {
                    return x == n;
                });

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

module.exports = {
    validateScoreCommand: validateScoreCommand
};