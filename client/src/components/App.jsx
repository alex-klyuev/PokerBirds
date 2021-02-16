/* eslint-disable class-methods-use-this */
// REMOVE THIS LATER:
/* eslint-disable react/no-unused-state */
// no styling for now...let's get the game functionality working

import React from 'react';
import StartUpForm from './StartUpForm';
import PlayerContainer from './PlayerContainer';
import TableContainer from './TableContainer';
import MessageBox from './MessageBox';

// GF is short for game functions
import GF from '../gameLogic/gameFunctions';
import Player from '../gameLogic/Player';

class App extends React.Component {
  constructor() {
    super();

    // GAME STATE is managed here
    this.state = {
      gameUnderway: false,
      playerObjectArray: [{}],
      numPlayers: 0,
      buyIn: 0,
      // gameUnderway: true,
      // numPlayers: 4,
      // buyIn: 100,
      smallBlind: 0,
      bigBlind: 0,
      dealerId: 0,
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
    // this.handleRaise = this.handleRaise.bind(this);
  }

  componentDidMount() {
    // make request to API
    // if gameUnderway = true, render game view and populate game
    // if gameUnderway = false, render startup form view
  }

  // --- PLAYER INTERFACE FUNCTIONS ---

  /* handleRaise(bet, raiseAmount) {

    const {
      pot,
      actionState,
    }

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
  } */

  // --- GAME STARTUP FUNCTIONS ---

  registerNumPlayers(numPlayers) {
    const playerObjectArray = [];
    for (let i = 0; i < Number(numPlayers); i += 1) {
      playerObjectArray.push(new Player(i + 1));
    }
    this.setState({
      numPlayers: Number(numPlayers),
      playerObjectArray,
    });
  }

  // the state manages the dollar values as cents
  // (e.g. $20 is saved as 2000)
  // this allows players to play with cents without having to deal with decimals in the code
  registerBuyIn(buyIn) {
    // eslint-disable-next-line no-param-reassign
    buyIn = GF.convertToCents(Number(buyIn));

    // assign the buy in to each player
    const { playerObjectArray } = this.state;
    playerObjectArray.forEach((player) => {
      // eslint-disable-next-line no-param-reassign
      player.stack = buyIn;
    });

    this.setState({
      playerObjectArray,
      buyIn,
    });
  }

  registerSmallBlind(smallBlind) {
    this.setState({
      smallBlind: GF.convertToCents(Number(smallBlind)),
    });
  }

  registerBigBlind(bigBlind) {
    this.setState({
      bigBlind: GF.convertToCents(Number(bigBlind)),
    });
  }

  // --- GAME FLOW CONTROL FUNCTIONS ---

  startGame() {
    // pick random dealer
    const { numPlayers } = this.state;
    const dealerId = Math.floor(Math.random() * numPlayers + 1);

    // after updating state, start the dealer round
    this.setState({
      dealerId,
      gameUnderway: true,
    }, this.startDealerRound);
  }

  startDealerRound() {
    // Increment dealer
    let { dealerId } = this.state;
    dealerId += 1;
    // Post blinds - need access to players
    // Shuffle deck
    // Assign cards
    this.setState({
      dealerId,
    }, () => {
      console.log(this.state);
    });
  }

  // --- RENDER VIEW FUNCTIONS ---

  renderGameView() {
    const { playerObjectArray } = this.state;

    return (
      <div>
        <TableContainer />
        <PlayerContainer
          playerObjectArray={playerObjectArray}
          handleRaise={this.handleRaise}
        />
        <MessageBox message="message box" />
      </div>
    );
  }

  renderStartUpView() {
    const {
      numPlayers,
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
          numPlayers={numPlayers}
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
