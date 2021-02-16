/* eslint-disable no-param-reassign */
const showdown = (PG) => {
  const showdownHandRanks = [];
  for (let i = 0; i < PG.playerObjectArray.length; i++) {
    // for the players that remain, add a new object property consisting of that player's seven showdown cards
    if (PG.playerObjectArray[i].inGame) {
      const sevenCards = [...PG.board, ...PG.playerObjectArray[i].cards];

      // this function takes the player's seven showdown cards, and returns
      // the rank of the best five-hand card
      PG.playerObjectArray[i].showdownRank = bestHandRank(sevenCards);
      PG.playerObjectArray[i].showdownRank.playerIndex = i; // just for you AK ;)
      showdownHandRanks.push(PG.playerObjectArray[i].showdownRank);
    }
  }

  // returns the best hand rank and its player index
  return pickBestHand(showdownHandRanks);
};

const rankToHandStr = (rank) => {
  switch (rank) {
    case 8:
      return 'Straight Flush';
    case 7:
      return 'Four of a Kind';
    case 6:
      return 'Full House';
    case 5:
      return 'Flush';
    case 4:
      return 'Straight';
    case 3:
      return 'Three of a Kind';
    case 2:
      return 'Two Pair';
    case 1:
      return 'Pair';
    default:
      return 'High Card';
  }
};

const bestHandRank = (sevenCards) => {
  const currentCombination = [];
  currentCombination.length = 5; // just for you AK :)
  const handCombinations = [];

  // this function makes n choose k combinations of an input array of length n
  // and generates arrays of length k that constitute all combinations of the input
  // array elements and returns an array of all those arrays. it's n choose k
  const combine = (inputArray, k, start) => {
    if (k === 0) {
      handCombinations.push(currentCombination.slice());
      return;
    }

    for (let i = start; i <= inputArray.length - k; i++) {
      currentCombination[5 - k] = inputArray[i];
      combine(inputArray, k - 1, i + 1);
    }
  };

  combine(sevenCards, 5, 0);

  // iterate through each hand combination to return its rank, then push the
  // handRank array to handRanks
  const handRanks = [];
  for (let i = 0; i < handCombinations.length; i += 1) {
    const handRank = returnHandRank(handCombinations[i]);
    handRanks.push(handRank);
  }

  return pickBestHand(handRanks);
};

const pickBestHand = (handRanks) => {
  // sort the hand ranks and return the best one
  handRanks.sort((rank1, rank2) => {
    for (let i = 0; i < rank1.length; i++) {
      if (rank2[i] - rank1[i] !== 0) {
        return rank2[i] - rank1[i];
      }
    }
  });
  return handRanks[0];
};

/**
 * This function takes any five card hand and returns a unique rank array that can
 * compared to any other hand's rank array to determine which is better (or equal)
 * ranking system:
 *   8 - straight flush
 *   7 - four of a kind
 *   6 - full house
 *   5 - flush
 *   4 - straight
 *   3 - 3 of a kind
 *   2 - two pair
 *   1 - pair
 *   0 - high card
 *
 * Each hand will have a further ranking system within
 */
const returnHandRank = (hand) => {
  // sort hand by number rank from greatest to lowest
  hand.sort((card1, card2) => card2[0] - card1[0]);

  // iterate through the handFunctionsArray and return the hand
  for (let i = 0; i < handFunctionsArray.length; i += 1) {
    const handRank = handFunctionsArray[i](hand);
    if (handRank !== null) {
      return handRank;
    }
  }
};

const straightFlush = (hand) => {
  // check for flush; if not, function is broken immediately
  for (let i = 1; i <= 4; i += 1) {
    if (hand[i][1] !== hand[0][1]) {
      return null;
    }
  }

  // check for wheel straight (A -> 5)
  let wheelCounter = 0;
  if (hand[0][0] === 14) {
    for (let i = 1; i <= 4; i += 1) {
      if (hand[i][0] === 6 - i) {
        wheelCounter += 1;
      }
    }
  }

  // if it's a wheel, return the rank
  if (wheelCounter === 4) {
    // 5 is the high card in a wheel
    return [8, 5, 0, 0, 0, 0];
  }

  // check for remaining straights
  for (let i = 1; i <= 4; i++) {
    if (hand[i][0] !== hand[0][0] - i) {
      return null;
    }
  }

  // return SF with high card
  return [8, hand[0][0], 0, 0, 0, 0];
};

const fourOfAKind = (hand) => {
  const freqMap = makeFreqMap(hand);

  // make a specific object for the value of the 4 and the kicker
  const rankObj = {};
  for (const num in freqMap) {
    if (freqMap[num] === 4) {
      rankObj.fourVal = parseInt(num);
    } else {
      rankObj.kicker = parseInt(num);
    }
  }

  // check if there is four of a kind and return rank array
  if (rankObj.fourVal === undefined) {
    return null;
  }
  return [7, rankObj.fourVal, rankObj.kicker, 0, 0, 0];
};

const fullHouse = (hand) => {
  const freqMap = makeFreqMap(hand);

  // make a specific object for value of the 3 and the pair
  const rankObj = {};
  for (const num in freqMap) {
    if (freqMap[num] === 3) {
      rankObj.threeVal = parseInt(num);
    }
    if (freqMap[num] === 2) {
      rankObj.twoVal = parseInt(num);
    }
  }

  // check if there is a full house and return rank array
  if (rankObj.threeVal === undefined || rankObj.twoVal === undefined) {
    return null;
  }
  return [6, rankObj.threeVal, rankObj.twoVal, 0, 0, 0];
};

const flush = (hand) => {
  for (let i = 1; i <= 4; i++) {
    if (hand[i][1] !== hand[0][1]) {
      return null;
    }
  }

  // all 5 flush cards need to be ranked
  const flushArray = [];
  for (let i = 0; i < 5; i++) {
    flushArray.push(hand[i][0]);
  }
  return [5, ...flushArray];
};

const straight = (hand) => {
  // check for wheel (see straight flush for explanation)
  let wheelCounter = 0;
  if (hand[0][0] === 14) {
    for (let i = 1; i <= 4; i++) {
      if (hand[i][0] === 6 - i) {
        wheelCounter++;
      }
    }
  }
  if (wheelCounter === 4) {
    return [4, 5, 0, 0, 0, 0];
  }

  // check for remaining straights
  for (let i = 1; i <= 4; i++) {
    if (hand[i][0] !== hand[0][0] - i) {
      return null;
    }
  }
  return [4, hand[0][0], 0, 0, 0, 0];
};

const threeOfAKind = (hand) => {
  const freqMap = makeFreqMap(hand);

  // make a specific object for value of the 3
  const rankObj = {};
  for (const num in freqMap) {
    if (freqMap[num] === 3) {
      rankObj.threeVal = parseInt(num);
    }
  }

  // create an array for the kickers and add them in (this allows
  // them to stay ordered from highest to lowest)
  rankObj.kickerArray = [];
  for (let i = 0; i < 5; i++) {
    if (hand[i][0] !== rankObj.threeVal) {
      rankObj.kickerArray.push(hand[i][0]);
    }
  }

  // check if there is a 3 of a kind and return rank array
  if (rankObj.threeVal === undefined) {
    return null;
  }
  return [3, rankObj.threeVal, ...rankObj.kickerArray, 0, 0];
};

const twoPair = (hand) => {
  const freqMap = makeFreqMap(hand);

  // make a specific object for the values of both pairs (in an array
  // to be sorted later) and the kicker
  const rankObj = {
    pairValArray: [],
  };
  let pairCounter = 0;
  for (const num in freqMap) {
    if (freqMap[num] === 2) {
      rankObj.pairValArray.push(parseInt(num));
      pairCounter++;
    } else {
      rankObj.kicker = parseInt(num);
    }
  }

  // check if there is a two-pair, sort the pair values, and return rank array
  if (pairCounter !== 2) {
    return null;
  }
  rankObj.pairValArray.sort((a, b) => b - a);
  return [2, ...rankObj.pairValArray, rankObj.kicker, 0, 0];
};

const pair = (hand) => {
  const freqMap = makeFreqMap(hand);

  // make a specific object for value of the pair
  const rankObj = {};
  for (const num in freqMap) {
    if (freqMap[num] === 2) {
      rankObj.pairVal = parseInt(num);
    }
  }

  // create an array for the kickers and add them in (this allows
  // them to stay ordered from highest to lowest)
  rankObj.kickerArray = [];
  for (let i = 0; i < 5; i++) {
    if (hand[i][0] !== rankObj.pairVal) {
      rankObj.kickerArray.push(hand[i][0]);
    }
  }

  // check if there is a pair and return rank array
  if (rankObj.pairVal === undefined) {
    return null;
  }
  return [1, rankObj.pairVal, ...rankObj.kickerArray, 0];
};

const highCard = (hand) => {
  const highCardArray = [];
  for (let i = 0; i < 5; i++) {
    highCardArray.push(hand[i][0]);
  }
  return [0, ...highCardArray];
};

// create an array of all the hand functions to iterate through in returnHandRank
const handFunctionsArray = [straightFlush, fourOfAKind, fullHouse, flush, straight,
  threeOfAKind, twoPair, pair, highCard];

// make an object where each card number is the key, and the amount of times
// that card number appears in the hand is that key's value
const makeFreqMap = (hand) => {
  const freqMap = {};
  for (let i = 0; i < 5; i++) {
    const num = hand[i][0];
    if (freqMap[num] === undefined) {
      freqMap[num] = 0;
    }
    freqMap[num]++;
  }
  return freqMap;
};

// the "build deck" function simply creates a new full deck
const buildDeck = (PG) => {
  PG.deckArray = [];
  for (let i = 0; i < 13; i++) {
    const spadesCard = [i + 2, 'S'];
    const clubsCard = [i + 2, 'C'];
    const diamondCard = [i + 2, 'D'];
    const heartCard = [i + 2, 'H'];
    PG.deckArray.push(spadesCard, clubsCard, diamondCard, heartCard);
  }
};

// this function assigns cards from the deck to players. Remaining deck is returned and player objects are
// updated accordingly. Only needs to run once at the beginning of each dealer round
const dealCards = (PG) => {
  for (let i = 0; i < PG.playerObjectArray.length; i++) {
    for (let j = 0; j < 2; j++) {
      const randInt = randDeckArrayIdx(PG);
      PG.playerObjectArray[i].cards[j] = PG.deckArray[randInt];
      PG.deckArray.splice(randInt, 1);
    }
  }
};

// increments turn so that it can loop around the table
const incrementTurn = (PG) => {
  PG.turn += 1;
  PG.turn %= PG.playerObjectArray.length;

  // TO-DO: fix the message box
  PG.message = `Player ${PG.playerObjectArray[PG.dealer].ID} is the dealer\nPlayer ${PG.playerObjectArray[PG.turn].ID}, it's your turn`;
};

// this function finds the next player that's still in the game and increments the turn to them
const findNextPlayer = (PG) => {
  // iterates starting from the current turn until it finds the next player that hasn't folded,
  // then breaks the loop
  for (let i = 0; i < PG.playerObjectArray.length; i += 1) {
    if (!PG.playerObjectArray[PG.turn].inGame) {
      incrementTurn(PG);
    } else {
      break;
    }
  }
};

const postBlinds = (PG) => {
  // post small blind
  PG.minRaise = 0;
  PG.previousBet = 0;
  PG.playerObjectArray[PG.turn].raise(PG.smallBlind, PG);
  PG.playerObjectArray[PG.turn].actionState = 'SB';
  incrementTurn(PG);

  // post big blind; vars are set to 0 to allow a raise (so that later bb can check at the end of pre-flop)
  PG.minRaise = 0;
  PG.previousBet = 0;
  PG.playerObjectArray[PG.turn].raise(PG.bigBlind, PG);
  PG.playerObjectArray[PG.turn].actionState = 'BB';
  incrementTurn(PG);
  PG.minRaise = PG.bigBlind;
  PG.previousBet = PG.bigBlind;
  PG.allowCheck = false;
};

const randDeckArrayIdx = (PG) => Math.floor(Math.random() * PG.deckArray.length);

// takes a card out of the deck and adds it to the board next opening.
// will need to be called 3 times for the flop, once for turn and once for river.
const addToBoard = (PG) => {
  const randInt = randDeckArrayIdx(PG);
  for (let i = 0; i < 5; i += 1) {
    if (PG.board[i] === '') {
      PG.board[i] = PG.deckArray[randInt];
      PG.deckArray.splice(randInt, 1);
      return;
    }
  }
};

const flop = (PG) => {
  addToBoard(PG);
  addToBoard(PG);
  addToBoard(PG);
};

// takes in the card array of 2, and returns 1 string
const beautifyCard = (card) => {
  const num = card[0].toString();
  switch (num) {
    case '11':
      return `J${card[1]}`;
    case '12':
      return `Q${card[1]}`;
    case '13':
      return `K${card[1]}`;
    case '14':
      return `A${card[1]}`;
    default:
      return num + card[1];
  }
};

// this function logs the current game condition so that everyone can see it.
// this includes the player id's, stacks, and cards to indicate if they're in the game or not.
// also indicates the round status: whether the player has checked, raised, or called, and how much they have
// committed to the pot.
// it will also demonstrate the board and the pot.
const outputGameStatus = (PG) => {
  let outputLine1 = '\n';
  let outputLine2 = '';
  let outputLine3 = '';
  let outputLine4 = '';
  let outputLine5 = '';

  // this for loop builds the 5 lines required to show what each player has, their pot commitment, and their previous action.
  for (let i = 0; i < PG.playerObjectArray.length; i++) {
    // P1, P2, etc.
    outputLine1 = `${outputLine1}P${(i + 1).toString()}      `;

    // since stack amount may vary, need to equalize the stack line to a total of 8 chars per player.
    let str = convertToDollars(PG.playerObjectArray[i].stack).toString();
    let spaces = '';
    for (let j = 0; j < (7 - str.length); j++) {
      spaces += ' ';
    }
    outputLine2 = `${outputLine2}$${str}${spaces}`;

    // show cards only for players that are still in the game
    if (PG.playerObjectArray[i].inGame) {
      outputLine3 = `${outputLine3}🂠🂠      `;
    } else {
      outputLine3 = `${outputLine3}        `;
    }

    // since action word length will vary, need to equalize line to 8 chars per player
    str = PG.playerObjectArray[i].actionState;
    spaces = '';
    for (let j = 0; j < (8 - str.length); j++) {
      spaces = `${spaces} `;
    }
    outputLine4 = outputLine4 + str + spaces;

    // since pot commitment will vary, need to equalize line to 8 chars per player
    if (PG.playerObjectArray[i].potCommitment === 0) {
      outputLine5 = `${outputLine5}        `;
    } else {
      str = convertToDollars(PG.playerObjectArray[i].potCommitment).toString();
      spaces = '';
      for (let j = 0; j < (7 - str.length); j++) {
        spaces = `${spaces} `;
      }
      outputLine5 = `${outputLine5}$${str}${spaces}`;
    }
  }

  // sixth line shows the board & seventh line shows the pot
  let outputLine6 = '\nBoard: ';
  if (PG.board[0] !== '') {
    outputLine6 = `${outputLine6}| `;
  }
  for (let i = 0; i < 5; i++) {
    if (PG.board[i] !== '') {
      outputLine6 = `${outputLine6 + beautifyCard(PG.board[i])} | `;
    }
  }

  console.log(outputLine1);
  console.log(outputLine2);
  console.log(outputLine3);
  console.log(outputLine4);
  console.log(outputLine5);
  console.log(outputLine6);
  console.log(`Pot: $${convertToDollars(PG.pot).toString()}`);
};

// output that comes under the board
const outputPlayerInquiry = (PG) => {
  console.log(`\nPlayer ${PG.playerObjectArray[PG.turn].ID}, it's your turn.`);
  console.log(`Your cards: | ${beautifyCard(PG.playerObjectArray[PG.turn].cards[0])} | ${beautifyCard(PG.playerObjectArray[PG.turn].cards[1])} |`);
  console.log(`Min bet: $${convertToDollars(PG.previousBet + PG.minRaise)} \n`);
};

// just to make it easier to keep track where I'm doing this
const convertToDollars = (value) => {
  value /= 100;
  return value;
};
const convertToCents = (value) => {
  value *= 100;
  return value;
};

// function to toggle the various methods corresponding to player actions
const handlePlayerAction = (action, PG) => {
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
};

// Action round ending conditions fall into two categories:
//  1. "No-raise": where there has been no raise and everyone checks or folds,
//  or in the case of the pre-flop, calls, checks, or folds.
//  2. "Raise": where there is one remaining raiser and everyone else behind calls or folds.
const checkActionRoundEndingCondition = (PG) => {
  let actionCounter1 = 0;
  let actionCounter2 = 0;
  for (let i = 0; i < PG.playerObjectArray.length; i += 1) {
    // handles both pre-flop and post-flop "no raise" situations
    if (PG.playerObjectArray[i].actionState === 'call' || PG.playerObjectArray[i].actionState === 'fold'
      || PG.playerObjectArray[i].actionState === 'check' || PG.playerObjectArray[i].actionState === '') {
      actionCounter1 += 1;
    }

    // JJ-COMMENT: if else instead of two if statements?

    // handles "raise" situations
    if (PG.playerObjectArray[i].actionState === 'call' || PG.playerObjectArray[i].actionState === 'fold'
      || PG.playerObjectArray[i].actionState === '') {
      actionCounter2 += 1;
    }
  }

  // can be combined later
  // no-raise scenario
  if (actionCounter1 === PG.playerObjectArray.length) {
    console.log('action round ended via no-raise scenario'); // free cards smh cod clam it
    return true;
  }

  // raise scenario
  if (actionCounter2 === PG.playerObjectArray.length - 1 && PG.playerObjectArray[PG.turn].actionState === 'raise') {
    console.log('action round ended via raise scenario'); // no free cards baby!
    return true;
  }

  // action round ending conditions not met
  return false;
};

// this function will end the dealer round when everyone except one person has folded.
// That person will win the pot. This is one of two ways a dealer round can end;
// the other is with a showdown, which has its own function.
const checkDealerRoundEndingCondition = (PG) => {
  let dealerCounter = 0;
  let winnerIndex;
  for (let i = 0; i < PG.playerObjectArray.length; i += 1) {
    if (PG.playerObjectArray[i].actionState === 'fold' || PG.playerObjectArray[i].actionState === '') {
      dealerCounter += 1;
    } else {
      winnerIndex = i;
    }
  }

  if (dealerCounter === PG.playerObjectArray.length - 1) {
    // move pot to winner's stack
    PG.playerObjectArray[winnerIndex].stack += PG.pot;
    PG.message = `Player ${PG.playerObjectArray[winnerIndex].ID} wins $${convertToDollars(PG.pot)}`;
    PG.pot = 0;
    return true;
  }

  // dealer round didn't end
  return false;
};

// this function restarts the following action round
const refreshActionRound = (PG) => {
  // clear pot commitment and action states; cards remain the same; reset PG.minraise
  for (let i = 0; i < PG.playerObjectArray.length; i += 1) {
    PG.playerObjectArray[i].potCommitment = 0;
    PG.playerObjectArray[i].actionState = '';
  }
  PG.previousBet = 0;
  PG.minRaise = PG.bigBlind;

  // action in remaining three rounds begins with the small blind
  PG.turn = PG.dealer;
  incrementTurn(PG);
  findNextPlayer(PG);

  // hacky way of setting players to still be in the action round so that the ending condition
  // functions don't immediately read the turn as over at the beginning of the round (could probably
  // be improved to be more clear). Still a blank string so that nothing is output to the board
  for (let i = 0; i < PG.playerObjectArray.length; i += 1) {
    if (PG.playerObjectArray[i].inGame) {
      PG.playerObjectArray[i].actionState = ' ';
    }
  }

  // allow checking at beginning of round
  PG.allowCheck = true;

  // unnecessary for react:
  // outputGameStatus(PG);
  // outputPlayerInquiry(PG);
};

// this function restarts the following dealer round
const refreshDealerRound = (PG) => {
  // refresh all these variables.
  for (let i = 0; i < PG.playerObjectArray.length; i += 1) {
    PG.playerObjectArray[i].potCommitment = 0;
    PG.playerObjectArray[i].actionState = '';
    PG.playerObjectArray[i].cards = [[], []];
    PG.playerObjectArray[i].inGame = true;

    // If a player lost their money, they stay out;
    // buy back or leave table functionality not included

    // DOUBLE CHECK THIS when showdown and side-pot parts are developed
    if (PG.playerObjectArray[i].stack === 0) {
      PG.playerObjectArray[i].inGame = false;
    }
  }

  // increment dealer
  PG.dealer += 1;
  PG.dealer %= PG.playerObjectArray.length;

  // clear the board, build a new full deck, and deal cards to the players
  PG.board = ['', '', '', '', ''];
  buildDeck(PG);
  dealCards(PG);

  // set turn to small blind, next after dealer
  PG.turn = PG.dealer;
  incrementTurn(PG);

  // post blinds
  postBlinds(PG);

  // edge case scenario where there are only 2 players and sb = bb,
  // first player to act is sb. this allows them to check
  if (PG.playerObjectArray[PG.turn].actionState === 'SB' && PG.smallBlind === PG.bigBlind) {
    PG.allowCheck = true;
  }

  // declare the dealer, output the first game board, and announce the first turn
  PG.message = `\nPlayer ${PG.playerObjectArray[PG.dealer].ID} is the dealer\nPlayer ${PG.playerObjectArray[PG.turn].ID}, it's your turn`;
};

export default {
  showdown,
  buildDeck,
  dealCards,
  incrementTurn,
  postBlinds,
  addToBoard,
  flop,
  beautifyCard,
  randDeckArrayIdx,
  outputGameStatus,
  outputPlayerInquiry,
  convertToDollars,
  convertToCents,
  handlePlayerAction,
  checkActionRoundEndingCondition,
  checkDealerRoundEndingCondition,
  refreshActionRound,
  refreshDealerRound,
  findNextPlayer,
  straightFlush,
  returnHandRank,
  rankToHandStr,
};
