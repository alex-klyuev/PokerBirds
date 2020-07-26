const MAX_PLAYERS_PER_GAME = 8;
const NUM_CARDS_PER_PLAYER = 2;
const MAX_BUYIN_IN_CENTS = 100000;

const RANKS = {
    straightFlush: 8,
    fourOfAKind: 7,
    fullHouse: 6,
    flush: 5,
    straight: 4,
    threeOfAKind: 3,
    twoPair: 2,
    pair: 1,
    highCard: 0,
};

const NUM_CARDS_IN_DECK = 52;

// Yes, this could be an array (with a '-1' property lol), but it's much clearer to make it an object.
const ACTION_ROUNDS = {
    '-1': 'uninitialized',
    0: 'pre-flop',
    1: 'flop',
    2: 'turn',
    3: 'river'
};

const NUM_ACTION_ROUND_DEALINGS = 3;

const ACTION_STATES = {
  'fold': true,
  'check': true,
  'call': true,
  'raise': true,
};

module.exports = {
  MAX_PLAYERS_PER_GAME,
  NUM_CARDS_PER_PLAYER,
  MAX_BUYIN_IN_CENTS,
  RANKS,
  NUM_CARDS_IN_DECK,
  ACTION_ROUNDS,
  NUM_ACTION_ROUND_DEALINGS,
  ACTION_STATES,
};
