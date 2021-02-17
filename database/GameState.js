const mongoose = require('mongoose');

// will allow saving several game states
const gameStateSchema = new mongoose.Schema({
  _id: Number,
  gameUnderway: Boolean,
  playerObjectArray: [Object],
  numPlayers: Number,
  buyIn: Number,
  smallBlind: Number,
  bigBlind: Number,
  dealer: Number,
  turn: Number,
  pot: Number,
  actionRoundState: Number,
  board: Array,
  deckArray: Array,
  deckColor: String,
  minRaise: Number,
  previousBet: Number,
  allowCheck: Boolean,
  message: String,
});

const GameState = mongoose.model('GameState', gameStateSchema);

module.exports = GameState;
