var elo = require('../src/elo');
var assert = require("assert");

describe('ELO', function () {
    describe('#elo', function () {
        it('draw', function () {
            const players = [
                {
                    rating: 1200,
                    score: 0.5,
                    k: 32
                },
                {
                    rating: 1200,
                    score: 0.5,
                    k: 32
                }
            ];
            assert.deepEqual([1200, 1200], elo(players));
        });
        it('win', function () {
            const players = [
                {
                    rating: 1200,
                    score: 1,
                    k: 32
                },
                {
                    rating: 1200,
                    score: 0,
                    k: 32
                }
            ];
            assert.deepEqual([1216, 1184], elo(players));
        });
    });
});