function expScore(players) {
    const e = 1 / (1 + Math.pow(10, (players[0].rating - players[1].rating) / 400));
    return [
        e,
        1 - e
    ];
}

function elo(players) {
    const expected = expScore(players);
    return [
        players[0].rating + players[0].k * (players[0].score - expected[0]),
        players[1].rating + players[1].k * (players[1].score - expected[1])
    ];
}

function

module.exports = elo;