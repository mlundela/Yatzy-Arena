var validate = require('../src/game-utils').validateScoreCommand;
var assert = require("assert");

describe('game-utils', function () {
    describe('validateScoreBox()', function () {
        it('1-6', function () {
            assert.equal(true, validate(1, [1]));
            assert.equal(true, validate(1, [1, 1]));
            assert.equal(false, validate(1, [2]));
            assert.equal(false, validate(1, [1, 2]));
            assert.equal(false, validate(1, []));
        });
        it('One pair', function () {
            assert.equal(true, validate(7, [1, 1]));
            assert.equal(true, validate(7, [6, 6]));
            assert.equal(false, validate(7, [2]));
            assert.equal(false, validate(7, [1, 2]));
            assert.equal(false, validate(7, [1, 1, 2]));
            assert.equal(false, validate(7, []));
        });
        it('Two pair', function () {
            assert.equal(true, validate(8, [1, 1, 3, 3]));
            assert.equal(false, validate(8, [1, 2, 3, 3]));
            assert.equal(false, validate(8, [3, 3, 3, 3]));
            assert.equal(false, validate(8, [1]));
            assert.equal(false, validate(8, []));
        });
        it('Three of a kind', function () {
            assert.equal(true, validate(9, [1, 1, 1]));
            assert.equal(false, validate(9, [1, 1, 1, 1]));
            assert.equal(false, validate(9, [1, 1, 2]));
            assert.equal(false, validate(9, []));
        });
        it('Four of a kind', function () {
            assert.equal(true, validate(10, [1, 1, 1, 1]));
            assert.equal(false, validate(10, [1, 1, 1, 2]));
            assert.equal(false, validate(10, [1, 1, 1, 1, 1]));
            assert.equal(false, validate(10, []));
        });
        it('Small straight', function () {
            assert.equal(true, validate(11, [1, 2, 3, 4, 5]));
            assert.equal(true, validate(11, [1, 3, 2, 5, 4]));
            assert.equal(false, validate(11, [1, 1, 3, 3, 4]));
            assert.equal(false, validate(11, [1, 2, 3, 4]));
            assert.equal(false, validate(11, []));
        });
        it('Large straight', function () {
            assert.equal(true, validate(12, [2, 3, 6, 5, 4]));
            assert.equal(false, validate(12, [1, 1, 3, 3, 4]));
            assert.equal(false, validate(12, [1, 2, 3, 4]));
            assert.equal(false, validate(12, []));
        });
        it('House', function () {
            assert.equal(true, validate(13, [1, 1, 3, 3, 1]));
            assert.equal(false, validate(13, [1, 1, 3, 3, 4]));
            assert.equal(false, validate(13, [1, 1, 3, 4]));
            assert.equal(false, validate(13, []));
        });
        it('Chance', function () {
            assert.equal(true, validate(14, [1, 3, 6, 5, 4]));
            assert.equal(false, validate(14, [1]));
            assert.equal(false, validate(14, []));
        });
        it('Yatzy', function () {
            assert.equal(true, validate(15, [1, 1, 1, 1, 1]));
            assert.equal(false, validate(15, [1, 1, 1, 1, 2]));
            assert.equal(false, validate(15, [1, 1, 1, 1]));
            assert.equal(false, validate(15, []));
        });
    });
});