/* eslint-disable no-param-reassign */

// TO-DO: Remove these later
/* eslint-disable class-methods-use-this */
/* eslint-disable react/no-unused-state */

// --- ACRONYMS ---
// PG = poker game -> replacement for the state for use within functions
// GF = game functions

import React from 'react';
import StartUpForm from './StartUpForm';
import PlayerContainer from './PlayerContainer';
import TableContainer from './TableContainer';
import MessageBox from './MessageBox';
import GF from '../gameLogic/gameFunctions';
import Player from '../gameLogic/Player';

class App extends React.Component {
  constructor() {
    super();

    // GAME STATE is managed here
    this.state = {
      playerObjectArray: [],
      gameUnderway: false,
      numPlayers: 0,
      buyIn: 0,
      // gameUnderway: true,
      // numPlayers: 4,
      // buyIn: 10000,
      smallBlind: 0,
      bigBlind: 0,
      dealer: 0,
      turn: 0,
      pot: 0,
      // 0 = pre-flop, 1 = flop, 2 = turn, 3 = river
      actionRoundState: 0,
      board: ['', '', '', '', ''],
      deckArray: [],
      deckColor: '',
      minRaise: 0,
      previousBet: 0,
      allowCheck: false,
      message: '',
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

    // for dev purposes:
    // const PG = this.state;
    // for (let i = 1; i <= Number(PG.numPlayers); i += 1) {
    //   PG.playerObjectArray.push(new Player(i));
    // }
    // this.setState(PG);
  }

  // --- PLAYER INTERFACE FUNCTIONS ---

  handleRaise(ID, bet) {
    bet = GF.convertToCents(bet);
    const PG = this.state;
    PG.playerObjectArray[ID - 1].raise(bet, PG);
    this.setState(PG);
  }

  // --- GAME STARTUP FUNCTIONS ---

  registerNumPlayers(numPlayers) {
    const playerObjectArray = [];
    for (let i = 1; i <= Number(numPlayers); i += 1) {
      playerObjectArray.push(new Player(i));
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
    buyIn = GF.convertToCents(Number(buyIn));

    // assign the buy in to each player
    const { playerObjectArray } = this.state;
    playerObjectArray.forEach((player) => {
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
    const PG = this.state;

    // pick random player to begin as the first dealer
    PG.dealer = Math.floor(Math.random() * PG.playerObjectArray.length);
    PG.gameUnderway = true;

    // pick a color for the game
    PG.deckColor = Math.floor(Math.random() * 2) ? 'Blue' : 'Red';

    // after updating state, start the dealer round
    this.setState(PG, this.startDealerRound);
  }

  startDealerRound() {
    const PG = this.state;

    // build a new full deck and deal cards to the players
    GF.buildDeck(PG);
    GF.dealCards(PG);

    // set turn to small blind, next after dealer
    PG.turn = PG.dealer;
    GF.incrementTurn(PG);

    // post blinds
    GF.postBlinds(PG);

    // TO-DO: Modify to be more dynamic with the UI
    // (focus that player somehow, gray out the others, etc.)
    PG.message = `Player ${PG.dealer + 1} is the dealer\nPlayer ${PG.turn + 1}, it's your turn`;

    // edge case scenario where there are only 2 players and sb = bb, first player to act is sb
    // and this allows them to check
    if (PG.playerObjectArray[PG.turn].actionState === 'SB' && PG.smallBlind === PG.bigBlind) {
      PG.allowCheck = true;
    }

    this.setState(PG);
  }

  // --- RENDER VIEW FUNCTIONS ---

  renderGameView() {
    const PG = this.state;

    return (
      <div>
        <TableContainer PG={PG} />
        <PlayerContainer
          PG={PG}
          handleRaise={this.handleRaise}
        />
        <MessageBox message={PG.message} />
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
