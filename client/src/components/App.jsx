// REMOVE THIS LATER:
/* eslint-disable react/no-unused-state */
// no styling for now...let's get the game functionality working

import React from 'react';
import StartUpForm from './StartUpForm';
import Player from '../gameLogic/Player';
import PlayerContainer from './PlayerContainer';

// GF is short for game functions
import GF from '../gameLogic/gameFunctions';

class App extends React.Component {
  constructor() {
    super();

    // GAME STATE is managed here
    this.state = {
      gameUnderway: true,
      playerObjectArray: [],
      buyIn: -1,
      smallBlind: -1,
      bigBlind: -1,
      dealer: 0,
      turn: 0,
      pot: 0,
      // 0 = pre-flop, 1 = flop, 2 = turn, 3 = river
      actionRoundState: 0,
      board: ['', '', '', '', ''],
      deckArray: [],
      minRaise: 0,
      previousBet: 0,
      allowCheck: false,
    };

    this.registerNumPlayers = this.registerNumPlayers.bind(this);
    this.registerBuyIn = this.registerBuyIn.bind(this);
    this.registerSmallBlind = this.registerSmallBlind.bind(this);
    this.registerBigBlind = this.registerBigBlind.bind(this);
    this.startGame = this.startGame.bind(this);
  }

  componentDidMount() {
    // make request to API
    // if gameUnderway = true, render game view and populate game
    // if gameUnderway = false, render startup form view
  }

  registerNumPlayers(numPlayers) {
    // create player object array
    const playerObjectArray = [];
    for (let i = 0; i < numPlayers; i += 1) {
      playerObjectArray.push(new Player(i + 1));
    }
    this.setState({
      playerObjectArray,
    });
  }

  // the state manages the dollar values as cents
  // (e.g. $20 is saved as 2000)
  // this allows players to play with cents without having to deal with decimals in the code
  registerBuyIn(buyIn) {
    this.setState({
      buyIn: GF.convertToCents(buyIn),
    });
  }

  registerSmallBlind(smallBlind) {
    this.setState({
      smallBlind: GF.convertToCents(smallBlind),
    });
  }

  registerBigBlind(bigBlind) {
    this.setState({
      bigBlind: GF.convertToCents(bigBlind),
    });
  }

  startGame() {
    this.setState({
      gameUnderway: true,
    });
  }

  renderGameView() {

    return (
      <div>
        <div>Game View</div>
        <PlayerContainer />
      </div>
    );
  }

  renderStartUpView() {
    const {
      playerObjectArray,
      buyIn,
      smallBlind,
      bigBlind,
    } = this.state;

    return (
      <div>
        <div>Welcome to PokerBirds! 🐦</div>
        <StartUpForm
          registerNumPlayers={this.registerNumPlayers}
          registerBuyIn={this.registerBuyIn}
          registerSmallBlind={this.registerSmallBlind}
          registerBigBlind={this.registerBigBlind}
          startGame={this.startGame}
          numPlayers={playerObjectArray.length}
          buyIn={buyIn}
          smallBlind={smallBlind}
          bigBlind={bigBlind}
        />
      </div>
    );
  }

  render() {
    const { gameUnderway } = this.state;
    if (gameUnderway) {
      return this.renderGameView();
    }
    return this.renderStartUpView();
  }
}

export default App;
