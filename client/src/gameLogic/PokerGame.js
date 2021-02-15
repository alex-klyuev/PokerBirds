class PokerGame {
  constructor() {
    // CONSTANT GLOBAL VARIABLES --- they'll remain the same for the entire game once initialized
    this.playerObjectArray = [];
    this.buyIn = -1;
    this.smallBlind = -1;
    this.bigBlind = -1;

    // GLOBAL VARIABLES --- vars such as dealer & turn that iterate
    // through arrays are based on array metrics (0-7)
    this.CLFstate = 0;
    this.dealer = 0;
    this.turn = 0;
    this.pot = 0;
    this.actionRoundState = 0; // 0 = pre-flop, 1 = flop, 2 = turn, 3 = river
    this.board = ['', '', '', '', ''];
    this.deckArray = [];
    this.minRaise = 0;
    this.previousBet = 0;
    // allowCheck var indicates whether previous action was a check (allowCheck = true),
    // allowing for following player to check as well.
    // starts this way automatically at beginning of flop, turn, and river.
    // A raise by any player will toggle the state to false for the rest of the round.
    // Is also toggled for the big blind pre-flop and small blind if SB = BB.
    this.allowCheck = false;
  }
}

module.exports = {
  PokerGame,
};
