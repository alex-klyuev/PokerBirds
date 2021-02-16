/* eslint-disable no-param-reassign */
class Player {
  constructor(ID) {
    this.ID = ID;
    this.stack = 0;
    this.cards = [[], []];
    this.actionState = '';
    this.potCommitment = 0;
    this.inGame = true;
    this.showdownRank = [];
  }

  // the raise function is the only one of the four actions that depends
  // on a numerical input from the user, hence it is the only one that takes an argument
  raise(bet, PG) {
    // since user inputs total bet, the raise amount is
    // the difference between the bet and player's pot commitment
    const raiseAmount = bet - this.potCommitment;

    const newStack = this.stack - raiseAmount;
    if (newStack < 0) {
      // eslint-disable-next-line no-alert
      alert(`Player ${this.ID} cannot bet ${bet} because their stack would go negative.`);
      return;
    }

    // update stack and increase pot
    this.stack = newStack;
    PG.pot += raiseAmount;

    this.actionState = 'raise';

    // if the amount bet is greater than the previous bet and the minimum raise,
    // update the minimum raise. this should always occur unless
    // the player raises all-in without having enough to go above the minimum raise
    if (bet > PG.previousBet + PG.minRaise) {
      PG.minRaise = bet - PG.previousBet;
    } // else {} should have code here to handle edge case 1 (see bottom notes)

    this.potCommitment += raiseAmount;

    // previous bet is updated. see bottom notes for edge case 2: second scenario assumed
    PG.previousBet = this.potCommitment;

    // once there's been a raise, no one else can check in that action round.
    PG.allowCheck = false;
  }

  call(PG) {
    this.actionState = 'call';

    // the amount that a call moves from stack to pot is equal to the previous bet
    // minus how much the player has already committed to the pot
    let callAmount = PG.previousBet - this.potCommitment;

    // if callAmount called bet is larger than stack, toggles an all-in call.
    if (callAmount > this.stack) {
      callAmount = this.stack;
    }

    // decrease stack, increase pot and increase pot commitment
    this.stack -= callAmount;
    PG.pot += callAmount;
    this.potCommitment += callAmount;
  }

  check() {
    this.actionState = 'check';
  }

  // need code to take player out of the game in a fold.
  fold() {
    this.actionState = 'fold';
    this.inGame = false;
    // set this equal to 0 so it doesn't display on the game output
    this.potCommitment = 0;
  }
}

export default Player;
