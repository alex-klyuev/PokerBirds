const { 
  getHandRank,
  makeFreqMap,
} = require('./utils');
const { NUM_CARDS_IN_DECK } = require('./constants');
const { PokerGame } = require('./PokerGame');
const { Player } = require('./Player');


const validatePlayerState = (obj) => {
  const { player } = obj;
  delete obj.player;
  Object.keys(obj).forEach((key) => {
    if (key === 'showdownRank' || key === 'cards') {
      expect(player[key]).toEqual(obj[key]);
    } else {
      expect(player[key]).toBe(obj[key]);
    }
  });
};


test(`new PokerGame() has correct values after immediate creation`, () => {
  const pg = new PokerGame();
  expect(pg.initialized).toBe(false);
  expect(pg.buyIn).toBe(-1);
  expect(pg.smallBlind).toBe(-1);
  expect(pg.bigBlind).toBe(-1);
  expect(pg.dealerIdx).toBe(0);
  expect(pg.turnIdx).toBe(0);
  expect(Array.isArray(pg.pots)).toBe(true);
  expect(pg.actionRound).toBe(-1);
  expect(pg.board).toEqual(['', '', '', '', '']);
  expect(pg.deck).toEqual([]);
  expect(pg.minRaise).toBe(0);
  expect(pg.previousBet).toBe(0);
});


test('PokerGame contains all exact 52 cards after building deck', () => {
  const pg = new PokerGame();
  pg.buildDeck();

  const correctDeck = [];
  for (let i = 2; i <= 14; i++) {
    let spadesCard = [i, '♠'], clubsCard = [i, '♣'], diamondCard = [i, '♦'], heartCard = [i, '♥'];
    correctDeck.push(spadesCard, clubsCard, diamondCard, heartCard);
  }

  expect(pg.deck.length).toBe(NUM_CARDS_IN_DECK);

  pg.deck.forEach((testCard, idx) => {
    expect(testCard).toEqual(correctDeck[idx]);
  });
});

test(`game allows to set SB and BB in that order`, () => {
  // SB == BB
  const pg1 = new PokerGame();
  pg1.setBuyIn(50000);
  expect(pg1.setSmallBlind(300)).toBe(true);
  expect(pg1.setSmallBlind(300)).toBe(true);

  // SB == BB/2
  const pg2 = new PokerGame();
  pg2.setBuyIn(50000);
  expect(pg2.setSmallBlind(300)).toBe(true);
  expect(pg2.setSmallBlind(600)).toBe(true);
});


test(`game does not set SB if buy-in not initialized`, () => {
  expect(new PokerGame().setSmallBlind(300)).toBe(false);
});


test(`game does not set BB if small blind not initialized`, () => {
  expect(new PokerGame().setBigBlind(300)).toBe(false);
});


test.skip('Showdown rank should have 6 cards', () => {
  const pg = new PokerGame();
  pg.setBuyIn(50000);
  pg.setSmallBlind(100);
  pg.setBigBlind(200);

  for (let i = 0; i < 2; i++) {
    pg.addPlayerToPosition(new Player(i, pg.buyIn, pg), i);
  }

  pg.buildDeck();
  expect(pg.deck.length).toBe(NUM_CARDS_IN_DECK);

  pg.dealCards();
  for (let i = 0; i < pg.players.length; i++) {
    expect(pg.players[i].cards.length).toBe(2);
  }

  pg.flop();
  expect(pg.board.filter((val) => val !== '').length).toBe(3);
  pg.addToBoard();
  expect(pg.board.filter((val) => val !== '').length).toBe(4);
  pg.addToBoard();
  expect(pg.board.filter((val) => val !== '').length).toBe(5);

  pg.getShowdownInfoAndAssignWinnings();
  for (let i = 0; i < pg.players.length; i++) {
    expect(pg.players[i].showdownRank.length).toBe(6);
  }
});

test.skip('Example game 1', () => {
  // 1. Create game
  const pg = new PokerGame();

  // 2. Initialize buyIn, smallBlind and bigBlind
  const BUYIN = 50000, SB_AMOUNT = 100, BB_AMOUNT = 200;
  pg.setBuyIn(BUYIN);
  expect(pg.buyIn).toBe(BUYIN);
  pg.setSmallBlind(SB_AMOUNT);
  expect(pg.smallBlind).toBe(SB_AMOUNT);
  pg.setBigBlind(BB_AMOUNT);
  expect(pg.bigBlind).toBe(BB_AMOUNT);

  // 3. Add players
  const NUM_PLAYERS = 4;
  const PLAYERS_IN_GAME = [];
  for (let i = 0; i < NUM_PLAYERS; i++) {
    let player = new Player(i, BUYIN, pg);
    PLAYERS_IN_GAME.push(player);
    pg.addPlayerToPosition(player, i);
  }
  // test 3
  expect(pg.players).toEqual(PLAYERS_IN_GAME);
  pg.players.forEach(player => {
    expect(player.stack).toBe(BUYIN);
    expect(player.cards).toEqual([[],[]]);
  });

  // 4. Build deck & deal cards
  pg.buildDeck();
  expect(pg.deck.length).toBe(NUM_CARDS_IN_DECK);
  let freqMap = makeFreqMap(pg.deck);
  expect(Object.keys(freqMap).length).toBe(13);
  Object.keys(freqMap).forEach((key) => {
    expect(freqMap[key]).toBe(4); // { 2: 4, 3: 4, 4: 4, 5: 4, ..., 10: 4, 11(J): 4, 12(Q): 4, 13(K): 4, 14(A): 4 }
  });
  pg.dealCards();
  PLAYERS_IN_GAME.forEach((player) => {
    // player should have 2 cards
    expect(player.cards.length).toBe(2);
    // each card should be an array of 2 things: (1) numberOrFaceValue and (2) suit
    player.cards.forEach((card) => {
      expect(card.length).toBe(2);
    });
  });
  // since we have dealt cards, there should be a total of: (52 - #players * 2) cards
  expect(pg.deck.length).toBe(NUM_CARDS_IN_DECK - NUM_PLAYERS * 2);

  // 5. Set turn to small blind, right after dealer
  const DEALER1 = 1, SB_IDX = 2, BB_IDX = 3;
  const dealerPlayer = PLAYERS_IN_GAME[DEALER1];
  pg.setDealer(DEALER1);
  expect(pg.dealerIdx).toBe(DEALER1);
  pg.turnIdx = pg.dealerIdx;
  pg.incrementTurn();
  expect(pg.turnIdx).toBe(SB_IDX);

  // 6. Post blinds
  pg.postBlinds();

  // test 6
  let smallBlindPlayer = PLAYERS_IN_GAME[SB_IDX];
  validatePlayerState({
    player: smallBlindPlayer,
    stack: BUYIN - SB_AMOUNT,
    actionState: 'SB',
    potCommitment: SB_AMOUNT,
    inGame: true,
    allowRaise: true,
    isAllIn: false,
    showdownRank: [],
  });

  let bigBlindPlayer = PLAYERS_IN_GAME[BB_IDX];
  validatePlayerState({
    player: bigBlindPlayer,
    stack: BUYIN - BB_AMOUNT,
    actionState: 'BB',
    potCommitment: BB_AMOUNT,
    inGame: true,
    allowRaise: true,
    isAllIn: false,
    showdownRank: [],
  });

  expect(pg.turnIdx).toBe(0);
  expect(pg.allowCheck).toBe(false);
  expect(pg.previousBet).toBe(BB_AMOUNT);
  expect(pg.minRaise).toBe(BB_AMOUNT);
  expect(pg.pot).toBe(SB_AMOUNT + BB_AMOUNT);

  let underTheGun = PLAYERS_IN_GAME[0];
  expect(pg.currentPlayer).toEqual(underTheGun);
  validatePlayerState({
    player: underTheGun,
    stack: BUYIN,
    actionState: '',
    potCommitment: 0,
    inGame: true,
    allowRaise: true,
    isAllIn: false,
    showdownRank: [],
  });

  // 7. Player 0 folds
  pg.currentPlayer.fold();
  // test 7
  validatePlayerState({
    player: underTheGun,
    stack: BUYIN,
    actionState: 'fold',
    potCommitment: 0,
    inGame: false,
    showdownRank: [],
  });
  expect(pg.pot).toBe(SB_AMOUNT + BB_AMOUNT);
  
  // 8. Player 1 (i.e. dealer) calls
  pg.incrementTurn();
  pg.incrementTurnToNextPlayerInGame();
  expect(pg.currentPlayer).toBe(dealerPlayer);
  pg.currentPlayer.call();
  validatePlayerState({
    player: dealerPlayer,
    stack: BUYIN - BB_AMOUNT,
    actionState: 'call',
    potCommitment: BB_AMOUNT,
    inGame: true,
    allowRaise: true,
    isAllIn: false,
    showdownRank: [],
  });
  expect(pg.pot).toBe(SB_AMOUNT + 2 * BB_AMOUNT);
  expect(pg.getDealerRoundInfo().ended).toBe(false);
  expect(pg.getActionRoundInfo().ended).toBe(false);


  // 9. Player 2 (i.e. SB) calls
  pg.incrementTurn();
  pg.incrementTurnToNextPlayerInGame();
  expect(pg.currentPlayer).toBe(smallBlindPlayer);
  pg.currentPlayer.call();
  validatePlayerState({
    player: smallBlindPlayer,
    stack: BUYIN - BB_AMOUNT,
    actionState: 'call',
    potCommitment: BB_AMOUNT,
    inGame: true,
    allowRaise: true,
    isAllIn: false,
    showdownRank: [],
  });
  expect(pg.getDealerRoundInfo().ended).toBe(false);
  expect(pg.getActionRoundInfo().ended).toBe(false);

  // 10. Player 3 (i.e. BB) checks
  pg.incrementTurn();
  pg.incrementTurnToNextPlayerInGame();
  expect(pg.currentPlayer).toBe(bigBlindPlayer);
  pg.currentPlayer.check();
  validatePlayerState({
    player: bigBlindPlayer,
    stack: BUYIN - BB_AMOUNT,
    actionState: 'check',
    potCommitment: BB_AMOUNT,
    inGame: true,
    allowRaise: true,
    isAllIn: false,
    showdownRank: [],
  });
  expect(pg.getDealerRoundInfo().ended).toBe(false);
  let actionRound = pg.getActionRoundInfo();
  expect(actionRound.ended).toBe(true);
  // no one raised here bcz everyone called BB
  expect(actionRound.scenario).toBe('no-raise');

  // 11. Flop
  pg.flop();
  pg.refreshActionRound();
  expect(pg.board.filter((card) => card !== '').length).toBe(3);
  pg.turnIdx = pg.dealerIdx;

  // TODO(anyone): Finish rest of the game
});


test.skip('Example game 2', () => {
  // TODO(anyone): write a sample game with asserts
});


test.skip('Example game 3', () => {
  // TODO(anyone): write a sample game with asserts
});


// playing around with the hands and their probabilities
test.skip('run monte carlo simulation', () => {
  const obtainedHand = (inputRank) => {
      const PG = new PokerGame();
      pg.setBuyIn(500);
      pg.setSmallBlind(1);
      pg.setBigBlind(2);
  
      for (let i = 0; i < 1; i++) {
          PG.addPlayerToPosition(new Player(i, PG.buyIn, PG), i);
      }
  
      PG.buildDeck();
      assert(PG.deck.length === NUM_CARDS_IN_DECK);
  
      PG.dealCards();
      for (let i = 0; i < PG.players.length; i++) {
          assert(PG.players[i].cards.length === 2);
      }
  
      PG.flop();
      PG.addToBoard();
      PG.addToBoard();
      assert(PG.board.length === 5);
      PG.getShowdownInfoAndAssignWinnings();
  
      for (let i = 0; i < PG.players.length; i++) {
          assert(PG.players[i].showdownRank.length === 6);
      }
  
      return PG.players[0].showdownRank[0] === inputRank;
  };

  const straightFlushRank = 8;
  const singlePair = 2;
  const NUM_ITERATIONS = 1000;

  let totalCounter = 0;
  let totalTime = 0;
  for (let i = 0; i < NUM_ITERATIONS; i++) {

      let desiredHandObtained = false
      let counter = 0;
      let start = new Date().getTime();
      while (!desiredHandObtained) {
          desiredHandObtained = obtainedHand(singlePair);
          counter++;
      }
  
      let finish = new Date().getTime();
      totalCounter += counter;
      totalTime += finish - start;
      // console.log(`Total time to get a high card ${finish - start}`);
      // console.log(`This bad ass motherfucker looped  ${counter} times baby`);
  }
  
  let avgTime = totalTime / 1000;
  let avgCounter = totalCounter / 1000;
  let prob = 100 * 1 / avgCounter;
  console.log(`Average time was ${avgTime}`);
  console.log(`Average # of loops was ${avgCounter}`);
  console.log(`The probability of getting ${rankToHandStr(singlePair)} is ${prob}%`);
});
