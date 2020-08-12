const { toDollars } = require('./utils');

class Pot {
  constructor(game) {
    this.game = game;
    this.open = true;
    this.currARAmount = 0;
    this.prevARsAmount = 0;
    this.playerCommitment = 0;
    this.history = new Map();
    this.potentialWinners = new Set();
    this.winHandRanks = null;
  }

  getPlayerHistory(pIdx) {
    return this.history.get(pIdx) || 0;
  }

  hasPlayerInPotentialWinners(pIdx) {
    return this.potentialWinners.has(pIdx);
  }

  playerIdxInPotentialWinners(pIdx) {
    return this.potentialWinners.has(pIdx);
  }

  hasAllInPlayer() {
    return Array.from(this.potentialWinners.values()).some((pIdx) => this.game.players[pIdx].isAllIn);
  }

  // returns true if there is a player that is all in other than pIdxInQuestion
  hasAllInPlayerThatsNot(pIdxInQuestion) {
    return Array.from(this.potentialWinners.values())
      .some((pIdx) => pIdx !== pIdxInQuestion && this.game.players[pIdx].isAllIn);
  }

  /**
   * @returns Pot[] of length 2:
   *  - 1st element contains a new version of this Pot but with a capped playerCommitment
   *  - 2nd element contains the "excess" from this Pot which is known as the side pot from a caller
   *    that cannot call the entire amount.
   */
  static separate(oldPot, newPlayerCommitment) {
    let newPot = new Pot(oldPot.game), sidePot = new Pot(oldPot.game);

    oldPot.history.forEach((pIdxCommitment, pIdx) => {
      let sidePotCommitment = pIdxCommitment - newPlayerCommitment;
      if (sidePotCommitment > 0) {
        sidePot.history.set(pIdx, sidePotCommitment);
        newPot.history.set(pIdx, newPlayerCommitment);
      } else {
        newPot.history.set(pIdx, newPlayerCommitment);
      }
    });

    newPot.currARAmount = Array.from(newPot.history.values()).reduce((acc, curr) => acc + curr, 0);
    sidePot.currARAmount = Array.from(sidePot.history.values()).reduce((acc, curr) => acc + curr, 0);

    newPot.prevARsAmount = oldPot.prevARsAmount;

    newPot.playerCommitment = newPlayerCommitment;
    sidePot.playerCommitment = Math.max(
      0,
      ...Array.from(sidePot.history.keys())
        .filter((pIdx) => oldPot.game.players[pIdx].inGame)
        .map((pIdx) => sidePot.getPlayerHistory(pIdx))
    );

    oldPot.potentialWinners.forEach((pIdx) => newPot.getPlayerHistory(pIdx) === newPlayerCommitment && newPot.potentialWinners.add(pIdx));
    sidePot.history.forEach((pIdxCommitment, pIdx) => {
      if (pIdxCommitment === sidePot.playerCommitment) {
        sidePot.potentialWinners.add(pIdx);
      }
    });

    return [newPot, sidePot];
  }

  toString() {
    let str = `Pot {` +
    ` open: ${this.open},` +
    ` currARAmount: $${toDollars(this.currARAmount)},` +
    ` prevARsAmount: $${toDollars(this.prevARsAmount)},` +
    ` playerCommitment: $${toDollars(this.playerCommitment)},`;

    let pcsStr = ` history: ${this.history.size === 0 ? '{}'
      : Array.from(this.history.keys()).map((key, idx, arr) => {
        if (idx === 0 && idx === arr.length - 1) {
          return `{ P${key}->$${toDollars(this.history.get(key))} }`
        } else if (idx === 0) {
          return `{ ` + `P${key}->$${toDollars(this.history.get(key))},`;
        } else if (idx === arr.length - 1) {
          return ` P${key}->$${toDollars(this.history.get(key))} }`;
        } else {
          return ` P${key}->$${toDollars(this.history.get(key))},`
        }
      }).join('')},`;

    let pwStr = ` potentialWinners: ${this.potentialWinners.size === 0 ? '{}'
      : Array.from(this.potentialWinners.values()).map((pIdx, idx, arr) => {
        if (idx === 0 && idx === arr.length - 1) {
          return `{ P${pIdx} }`
        } else if (idx === 0) {
          return `{ ` + `P${pIdx},`;
        } else if (idx === arr.length - 1) {
          return ` P${pIdx} }`;
        } else {
          return ` P${pIdx},`
        }
      }).join('')}`;

    return str + pcsStr + pwStr + ` }`;
  }
}

module.exports = {
  Pot,
};
