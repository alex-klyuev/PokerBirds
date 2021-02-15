// REMOVE THIS LATER:
/* eslint-disable react/no-unused-state */
// no styling for now...let's get the game functionality working

import React from 'react';
import StartUpForm from './StartUpForm';
import Player from '../gameLogic/Player';

// GF is short for game functions
import GF from '../gameLogic/gameFunctions';

class App extends React.Component {
  constructor() {
    super();

    this.state = {
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

  registerBuyIn(buyIn) {
    this.setState({
      buyIn: GF.convertToCents(buyIn),
    });
  }

  registerSmallBlind(smallBlind) {
    this.setState({
      smallBlind,
    });
  }

  registerBigBlind(bigBlind) {
    this.setState({
      bigBlind,
    });
  }

  render() {
    const {
      playerObjectArray,
      buyIn,
      smallBlind,
      bigBlind,
    } = this.state;

    // pass down to form in order to assist input validation
    const numPlayersFilled = playerObjectArray.length !== 0;
    const buyInFilled = buyIn !== -1;
    const smallBlindFilled = smallBlind !== -1;
    const bigBlindFilled = bigBlind !== -1;

    return (
      <div>
        <div>Welcome to PokerBirds! 🐦</div>
        <StartUpForm
          registerNumPlayers={this.registerNumPlayers}
          registerBuyIn={this.registerBuyIn}
          registerSmallBlind={this.registerSmallBlind}
          registerBigBlind={this.registerBigBlind}
          numPlayersFilled={numPlayersFilled}
          buyInFilled={buyInFilled}
          smallBlindFilled={smallBlindFilled}
          bigBlindFilled={bigBlindFilled}
          buyIn={buyIn}
        />
      </div>
    );
  }
}

export default App;
