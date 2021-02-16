/* eslint-disable no-console */
/* eslint-disable no-param-reassign */

// TO-DO: Remove these later
/* eslint-disable class-methods-use-this */
/* eslint-disable react/no-unused-state */

// --- ACRONYMS ---
// PG = poker game -> replacement for the state for use within functions
// GF = game functions

import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import StartUpForm from './StartUpForm';
import PlayerContainer from './PlayerContainer';
import TableContainer from './TableContainer';
import MessageBox from './MessageBox';
import GF from '../gameLogic/gameFunctions';
import Player from '../gameLogic/Player';

class App extends React.Component {
  constructor(props) {
    super(props);

    const { gameId } = this.props;

    // GAME STATE is managed here
    this.state = {
      _id: gameId,
      gameUnderway: false,
      playerObjectArray: [],
      numPlayers: 0,
      buyIn: 0,
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
    this.handlePlayerAction = this.handlePlayerAction.bind(this);
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

  handlePlayerAction(action) {
    const PG = this.state;
    // eslint-disable-next-line default-case
    switch (action[0]) {
      case 'call':
        PG.playerObjectArray[PG.turn].call(PG);
        break;
      case 'raise':
        PG.playerObjectArray[PG.turn].raise(action[1], PG);
        break;
      case 'fold':
        PG.playerObjectArray[PG.turn].fold();
        break;
      case 'check':
        PG.playerObjectArray[PG.turn].check();
        break;
    }

    GF.incrementTurn(PG);
    // function to find the next player that is still in the game
    GF.findNextPlayer(PG);

    // in the spirit of modularity, this function will pass the modified PG on to the next handler,
    // which will in turn update the state
    this.handleActionRound(PG);
  }

  // this function handles all action rounds
  handleActionRound(PG) {
    // handle the pre-flop
    if (PG.actionRoundState === 0) {
      // pre-flop, the big blind (and the small blind if it's equal to big blind)
      // have the option to check if all other players called or folded.
      let preflopCounter = 0;

      // toggles the check state for the small blind if it's equal to the big blind
      if (PG.playerObjectArray[PG.turn].actionState === 'SB' && PG.smallBlind === PG.bigBlind) {
        // count active raises on board; if the SB & BB are the only ones, they can check
        for (let i = 0; i < PG.playerObjectArray.length; i += 1) {
          if (PG.playerObjectArray[i].actionState !== 'raise') {
            preflopCounter += 1;
          }
        }

        if (preflopCounter === PG.playerObjectArray.length) {
          PG.allowCheck = true;
        }
      }

      // toggles the check state for the big blind - unless the BB is equal to the SB, in which case
      // it has already been toggled.

      // edge case: big blind re-raised and all other players called. Hmmm
      // TODO(anyone): Not sure if this is a TODO still or not? ^^
      if (PG.playerObjectArray[PG.turn].actionState === 'BB' && PG.smallBlind !== PG.bigBlind) {
        // count active raises on board; if the BB's is the only one, they can check
        for (let i = 0; i < PG.playerObjectArray.length; i += 1) {
          if (PG.playerObjectArray[i].actionState !== 'raise') {
            preflopCounter += 1;
          }
        }
        if (preflopCounter === PG.playerObjectArray.length) {
          PG.allowCheck = true;
        }
      }

      // check if dealer round is done. comes before action round
      // because of edge case where one player checks and all others fold.
      if (GF.checkDealerRoundEndingCondition(PG)) {
        // will set everything through the blinds up for next round
        GF.refreshDealerRound(PG);
        PG.actionRoundState = 0;
      }

      // check if action round is done
      if (GF.checkActionRoundEndingCondition(PG)) {
        // if so, add 3 cards to the board
        GF.flop(PG);
        // remaining code that is the same between each action round
        GF.refreshActionRound(PG);
        PG.actionRoundState += 1;
      }
    }

    // handle the flop and turn (same functionality for each)
    if (PG.actionRoundState === 1 || PG.actionRoundState === 2) {
      if (GF.checkDealerRoundEndingCondition(PG)) {
        GF.refreshDealerRound(PG);
        PG.actionRoundState = 0;
      }

      if (GF.checkActionRoundEndingCondition(PG)) {
        GF.addToBoard(PG); // turn & river
        GF.refreshActionRound(PG);
        PG.actionRoundState += 1;
      }
    }

    // handle the river
    if (PG.actionRoundState === 3) {
      if (GF.checkDealerRoundEndingCondition(PG)) {
        GF.refreshDealerRound(PG);
        PG.actionRoundState = 0;
        return;
      }

      // the difference on the river is the opportunity for a showdown
      if (GF.checkActionRoundEndingCondition(PG)) {
        // set the winning hand rank and its player index
        const winHandRank = GF.showdown(PG);

        // give the player the pot and reset it to 0
        PG.playerObjectArray[winHandRank.playerIndex].stack += PG.pot;
        PG.pot = 0;

        // state the winner and how they won
        PG.message = `Player ${PG.playerObjectArray[winHandRank.playerIndex].ID}`;
        PG.message += ` won with a ${GF.rankToHandStr(winHandRank[0])}`;

        // reset the dealer round
        GF.refreshDealerRound(PG);
        PG.actionRoundState = 0;
      }
    }

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

    this.startDealerRound(PG);
  }

  // this function is actually redudant with the "refresh dealer round" function;
  // will refactor later
  startDealerRound(PG) {
    const { gameId } = this.props;

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
    PG.message = `Player ${PG.playerObjectArray[PG.dealer].ID} is the dealer\nPlayer ${PG.playerObjectArray[PG.turn].ID}, it's your turn`;

    // edge case scenario where there are only 2 players and sb = bb, first player to act is sb
    // and this allows them to check
    if (PG.playerObjectArray[PG.turn].actionState === 'SB' && PG.smallBlind === PG.bigBlind) {
      PG.allowCheck = true;
    }

    // update the state in the database and begin the game
    // upon successful write
    axios.post(`/api/gamestate/${gameId}`, PG)
      .then(() => {
        this.setState(PG);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // --- RENDER VIEW FUNCTIONS ---

  renderGameView() {
    const PG = this.state;

    return (
      <div>
        <TableContainer PG={PG} />
        <PlayerContainer
          PG={PG}
          handlePlayerAction={this.handlePlayerAction}
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

App.propTypes = {
  gameId: PropTypes.string.isRequired,
};

export default App;
