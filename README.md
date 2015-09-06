Yatzy server
============


Rules
---

Ones: The sum of all dice showing the number 1.
Twos: The sum of all dice showing the number 2.
Threes: The sum of all dice showing the number 3.
Fours: The sum of all dice showing the number 4.
Fives: The sum of all dice showing the number 5.
Sixes: The sum of all dice showing the number 6.
If a player manages to score at least 63 points (an average of three of each number) in the upper section, they are awarded a bonus of 50 points.

Lower Section:

One Pair: Two dice showing the same number. Score: Sum of those two dice.
Two Pairs: Two different pairs of dice. Score: Sum of dice in those two pairs.
Three of a Kind: Three dice showing the same number. Score: Sum of those three dice.
Four of a Kind: Four dice with the same number. Score: Sum of those four dice.
Small Straight: The combination 1-2-3-4-5. Score: 15 points (sum of all the dice).
Large Straight: The combination 2-3-4-5-6. Score: 20 points (sum of all the dice).
Full House: Any set of three combined with a different pair. Score: Sum of all the dice.
Chance: Any combination of dice. Score: Sum of all the dice.
Yatzy: All five dice with the same number. Score: 50 points.


API
---

When connection is established between a bot and the server, the bot waits for messages from the server on the given format:

    {
        'key': 'STANDING',
        'roundNumber': 1,
        'score': [
            {
                'playerName': 'Bot1Anna',
                'rating': 1200,
                'score': '-,-,-,-,-,-,-,-,-,-,-,-,-,-,-'
            },
            {
                'playerName': 'DumBot',
                'rating': 1000,
                'score': '-,-,-,-,-,-,-,-,-,-,-,-,-,-,-'
            }
        ],
        'currentPlayer': {
            'playerName': 'Bot1Anna',
            'rollsLeft': 2,
            'dice': [5, 6, 1, 1, 3]
        }
    }
    
If `currentPlayer` is your bot, it is your bot's time to play! The bot may reply with two kinds of commands. If it still
has more rolls, it may chose to roll a selection of dice again. Here the first, second and 5th die is rolled:

    {
        'type': 'ROLL_DICE',
        'dice': [0, 1, 4]
    }
    
When you have no more rolls, it is expected that your bot selects which score box it wants to use. It can do so by 
sending the `SCORE_BOX` command. Please note that it does not have to use all its rolls.
    
    {
        'type': 'SCORE_BOX',
        'box': 0, // Ones,
        'dice': [2, 3]
    }
