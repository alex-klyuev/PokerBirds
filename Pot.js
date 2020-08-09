const { toDollars } = require('./utils');

class Pot {
  constructor(game) {
    this.game = game;
    this.open = true;
    this.amount = 0;
    this.playerCommitment = 0;
    this.playerCommitments = new Map();
    this.potentialWinners = new Set();
    this.winHandRanks = null;
  }

  playerIdxInPotentialWinners(pIdx) {
    return this.potentialWinners.has(pIdx);
  }

  toString() {
    let str = `Pot {` +
    ` open: ${this.open},` +
    ` amount: $${toDollars(this.amount)},` +
    ` playerCommitment: $${toDollars(this.playerCommitment)},`;

    let pcsStr = ` playerCommitments: ${this.playerCommitments.size === 0 ? '{}'
      : Array.from(this.playerCommitments.keys()).map((key, idx, arr) => {
        if (idx === 0 && idx === arr.length - 1) {
          return `{ P${key}: $${toDollars(this.playerCommitments.get(key))} }`
        } else if (idx === 0) {
          return `{ ` + `P${key}: $${toDollars(this.playerCommitments.get(key))},`;
        } else if (idx === arr.length - 1) {
          return ` P${key}: $${toDollars(this.playerCommitments.get(key))} }`;
        } else {
          return ` P${key}: $${toDollars(this.playerCommitments.get(key))},`
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
