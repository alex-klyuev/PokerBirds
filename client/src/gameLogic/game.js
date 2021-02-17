// --- REACT APP NOTES ---
//
// This file is not used by the React app, but is left for reference

/* GENERAL NOTES---------------------------------------------------------------------------------------------
This game is made so that you can play with cents, which is a feature I want available in the end product.
For that reason, player inputs are converted to cents by multiplying everything by 100, and then divided by
100 before logging back to the console. Open to changes on this front.                                    */

const {
  showdown,
  buildDeck,
  dealCards,
  incrementTurn,
  postBlinds,
  addToBoard,
  flop,
  outputGameStatus,
  outputPlayerInquiry,
  convertToCents,
  handlePlayerAction,
  checkActionRoundEndingCondition,
  checkDealerRoundEndingCondition,
  refreshActionRound,
  refreshDealerRound,
  findNextPlayer,
  rankToHandStr,
} = require('./gameFunctions');

const { PokerGame } = require('./pokerGame');

const PG = new PokerGame();

const { Player } = require('./Player');

// AUXILIARY COMMAND LINE FUNCTIONS: VALIDATE PLAYER INPUT AND THEN RETURN OBJECTS THAT ARE USED IN THE CLF--

const validateAndCreatePlayers = (input) => {
  // validation section
  if (input.length > 1 || input === '') {
    return false;
  }
  input = parseInt(input);
  if (input < 2 || input > 8) {
    return false;
  }

  // create player object array
  for (let i = 0; i < input; i++) {
    PG.playerObjectArray.push(new Player(i + 1));
  }

  return true;
};

const validateAndAssignBuyIn = (inputBuyIn) => {
  inputBuyIn = parseInt(inputBuyIn);
  if (isNaN(inputBuyIn) || inputBuyIn < 1 || inputBuyIn > 999) {
    return false;
  }
  PG.buyIn = convertToCents(inputBuyIn);
  return true;
};

const validateAndAssignBlind = (inputBlind, isSmallBlind) => {
  inputBlind = parseFloat(inputBlind);
  inputBlind = convertToCents(inputBlind);
  if (isNaN(inputBlind) || inputBlind < 1 || inputBlind > PG.buyIn / 20) {
    return false;
  }

  if (isSmallBlind) {
    PG.smallBlind = inputBlind;
  } else {
    PG.bigBlind = inputBlind;
  }

  return true;
};

// this function will validate player action. If a call, check, or fold, the function returns the respective string.
// in case of a raise, function returns the raise amount in cents.
const validateAndReturnPlayerAction = (input) => {
  const actionInput = input.slice(0, 4);
  let numericInput = input.slice(4);

  // some imperfect inputs are allowed in this game for the sake of simplicity of the code.
  // it's designed so that player intent is never misunderstood, however
  // this else if statement both validates the input and returns call, check, or fold if it's one of those.
  // if it's a raise, it goes on to the next section to validate the amount
  if (actionInput === 'call') {
    // validate that there is a raise on the board to be called. Second part is to allow the SB to call
    // when it is not equal to the big blind

    let raiseCounter = 0;
    for (let i = 0; i < PG.playerObjectArray.length; i++) {
      // this allows the small blind to call big blind as well
      if (PG.playerObjectArray[i].actionState === 'raise' || (PG.playerObjectArray[i].actionState === 'SB')) {
        raiseCounter++;
      }
    }

    // exception for situation where small blind is equal to big blind; SB cannot call there
    if (raiseCounter === 0 || PG.playerObjectArray[PG.turn].actionState === 'SB' && PG.smallBlind === PG.bigBlind) {
      console.log('You cannot call here.');
      return { valid: false };
    }
    return {
      valid: true,
      playerAction: ['call', ''],
    };
  } if (actionInput === 'fold') {
    return {
      valid: true,
      playerAction: ['fold', ''],
    };
  } if (actionInput === 'chec') {
    // validate that player is allowed to check
    if (PG.allowCheck === false) {
      console.log('You cannot check here.');
      return { valid: false };
    }
    return {
      valid: true,
      playerAction: ['check', ''],
    };
  } if (actionInput != 'bet ') {
    return { valid: false };
  }

  // second input: verify that the raise is an increment of the small blind, equal or above the minimum raise,
  // and less than or equal to the player's stack. exception is made if player bets stack; then bet gets through
  // regardless of the min raise.
  numericInput = convertToCents(parseFloat(numericInput));
  if (numericInput === PG.playerObjectArray[PG.turn].stack) {
    return {
      valid: true,
      playerAction: ['raise', numericInput],
    };
  }
  if (numericInput % PG.smallBlind != 0
        || numericInput < PG.previousBet + PG.minRaise
        || numericInput > PG.playerObjectArray[PG.turn].stack + PG.playerObjectArray[PG.turn].potCommitment) {
    console.log('You can\'t raise that amount.');
    return { valid: false };
  }
  return {
    valid: true,
    playerAction: ['raise', numericInput],
  };
};

// COMMAND LINE FUNCTION (CLF)-------------------------------------------------------------------------------

const handleCommandLineInput = (input) => {
  input = input.toString().substring(0, input.length - 1);
  // NO CODE FROM HERE SHOULD BE OUTSIDE OF A CLFstate IF STATEMENT

  // PRE-GAME CODE: runs once before the game begins-------------------------------------------------------

  // validate number of players and create objects for each player
  if (PG.CLFstate === 0) {
    const valid = validateAndCreatePlayers(input);
    if (!valid) {
      console.log('Please enter a valid input.');
      return;
    }

    // console logs for next block needs to occur within previous if statement
    PG.CLFstate++;
    console.log(`\nWelcome to the game, players 1 through ${PG.playerObjectArray.length}. Here are the game settings:`);
    console.log('Buy-ins must be in dollar increments. Blinds and bets can be in increments of cents,');
    console.log('but be sure to input them as decimals. The small blind will be the smallest chip size,');
    console.log('so the big blind and all bets must be multiples of that. The minimum buy-in is 20 times the big blind,');
    console.log('and the maximum is $999. Now, without further ado - what will your buy-in be?');
    return;
  }

  // validate buy-in, small blind, and big blind, and set global variables
  if (PG.CLFstate === 1) {
    const valid = validateAndAssignBuyIn(input);
    if (!valid) {
      console.error('Please enter a valid input.');
      return;
    }

    // set each player's stack to the buy-in
    for (let i = 0; i < PG.playerObjectArray.length; i++) {
      PG.playerObjectArray[i].stack = PG.buyIn;
      PG.playerObjectArray[i].cards = [[], []];
    }

    // iterate state and ask next question
    PG.CLFstate++;
    console.log('What will the small blind be?');
    return;
  }

  if (PG.CLFstate === 2) {
    const valid = validateAndAssignBlind(input, true);
    if (!valid) {
      console.error('Please enter a valid input.');
      return;
    }
    PG.CLFstate++;
    console.log('What will the big blind be?');
    return;
  }

  if (PG.CLFstate === 3) {
    const valid = validateAndAssignBlind(input, false);
    if (!valid) {
      console.error('Please enter a valid input.');
      return;
    }
    if (PG.smallBlind > PG.bigBlind || PG.bigBlind % PG.smallBlind !== 0) {
      console.error('Please enter a valid input.');
      return;
    }

    console.log('\nGreat! Let\'s begin the game. Here are the game rules:');
    console.log('To raise, enter \"bet\" followed by a space and the total amount you\'d like to bet (no dollar signs).');
    console.log('In the case of a re-raise, make sure you input the total amount you are raising to, not just the raise amount.');
    console.log('To call, check, or fold, simply enter \"call\", \"check\", or \"fold\". The first dealer will be picked randomly.');

    // pick random player to begin as the first dealer
    PG.dealer = Math.floor(Math.random() * PG.playerObjectArray.length);
    PG.CLFstate++;
  }

  // "DEALER ROUND BLOCK" - code block to iterate within each dealer round---------------------------------------
  // A "dealer round" is defined as the overall round from pre-flop to showdown, since dealer changes from round to round.
  // The four rounds from pre-flop to showdown will be called "action rounds".

  // Block 1 - only needs to run once at the beginning of each dealer round: everything until action after the big blind.
  if (PG.CLFstate === 4) {
    // build a new full deck and deal cards to the players
    buildDeck(PG);
    dealCards(PG);

    // set turn to small blind, next after dealer
    PG.turn = PG.dealer;
    incrementTurn(PG);

    // post blinds
    postBlinds(PG);

    // declare the dealer, output the first game board, and announce the first turn
    outputGameStatus(PG);
    outputPlayerInquiry(PG);

    // edge case scenario where there are only 2 players and sb = bb, first player to act is sb
    // and this allows them to check
    if (PG.playerObjectArray[PG.turn].actionState === 'SB' && PG.smallBlind === PG.bigBlind) {
      PG.allowCheck = true;
    }

    PG.CLFstate++;
    return;
  }

  // Block 2 handles the 4 action rounds - this code will cycle within a dealer round.

  // Handles the pre-flop action round (action round 0)
  if (PG.actionRoundState === 0) {
    const inputAction = validateAndReturnPlayerAction(input);
    if (!inputAction.valid) {
      console.log('Please enter a valid input.');
      return;
    }

    // function to call the method corresponding to player action
    handlePlayerAction(inputAction.playerAction, PG);

    // TODO(anyone): merge incrementTurn into findNextPlayer
    incrementTurn(PG);
    // function to find the next player that is still in the game
    findNextPlayer(PG);

    // once turn is incremented, following code is what needs to be executed for the next player before
    // next user input

    // pre-flop, the big blind (and the small blind if it's equal to big blind)
    // have the option to check if all other players called or folded.
    let preflopCounter = 0;

    // toggles the check state for the small blind if it's equal to the big blind
    if (PG.playerObjectArray[PG.turn].actionState === 'SB' && PG.smallBlind === PG.bigBlind) {
      // count active raises on board; if the SB & BB are the only ones, they can check
      for (let i = 0; i < PG.playerObjectArray.length; i++) {
        if (PG.playerObjectArray[i].actionState !== 'raise') {
          preflopCounter++;
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
    if (PG.playerObjectArray[PG.turn].actionState === 'BB' && PG.smallBlind != PG.bigBlind) {
      // count active raises on board; if the BB's is the only one, they can check
      for (let i = 0; i < PG.playerObjectArray.length; i++) {
        if (PG.playerObjectArray[i].actionState != 'raise') {
          preflopCounter++;
        }
      }
      if (preflopCounter === PG.playerObjectArray.length) {
        PG.allowCheck = true;
      }
    }

    // check if dealer round is done. comes before action round because of edge case where one player checks
    // and all others fold.
    if (checkDealerRoundEndingCondition(PG)) {
      // will set everything through the blinds up for next round and output to the board
      refreshDealerRound(PG);

      PG.actionRoundState = 0;
      return;
    }

    // check if action round is done
    if (checkActionRoundEndingCondition(PG)) {
      // flop
      flop(PG);

      // remaining code that is the same between each action round
      refreshActionRound(PG);

      PG.actionRoundState++;
      return;
    }

    outputGameStatus(PG);
    outputPlayerInquiry(PG);
    return;
  }

  // Handles the flop action round (action round 1)
  if (PG.actionRoundState === 1) {
    const inputAction = validateAndReturnPlayerAction(input);
    if (!inputAction.valid) {
      console.log('Please enter a valid input.');
      return;
    }

    handlePlayerAction(inputAction.playerAction, PG);
    // TODO(anyone): merge incrementTurn into findNextPlayer
    incrementTurn(PG);
    findNextPlayer(PG);

    if (checkDealerRoundEndingCondition(PG)) {
      refreshDealerRound(PG);
      PG.actionRoundState = 0;
      return;
    }

    if (checkActionRoundEndingCondition(PG)) {
      addToBoard(PG); // turn
      refreshActionRound(PG);
      PG.actionRoundState++;
      return;
    }

    outputGameStatus(PG);
    outputPlayerInquiry(PG);
    return;
  }

  // Handles the turn action round (action round 2)
  if (PG.actionRoundState === 2) {
    const inputAction = validateAndReturnPlayerAction(input);
    if (!inputAction.valid) {
      console.log('Please enter a valid input.');
      return;
    }

    handlePlayerAction(inputAction.playerAction, PG);
    // TODO(anyone): merge incrementTurn into findNextPlayer
    incrementTurn(PG);
    findNextPlayer(PG);

    if (checkDealerRoundEndingCondition(PG)) {
      refreshDealerRound(PG);
      PG.actionRoundState = 0;
      return;
    }

    if (checkActionRoundEndingCondition(PG)) {
      addToBoard(PG); // river
      refreshActionRound(PG);
      PG.actionRoundState++;
      return;
    }

    outputGameStatus(PG);
    outputPlayerInquiry(PG);
    return;
  }

  // Handles the river action round (action round 3)
  if (PG.actionRoundState === 3) {
    const inputAction = validateAndReturnPlayerAction(input);
    if (!inputAction.valid) {
      console.log('Please enter a valid input.');
      return;
    }

    handlePlayerAction(inputAction.playerAction, PG);
    outputGameStatus(PG);
    // TODO(anyone): merge incrementTurn into findNextPlayer
    incrementTurn(PG);
    findNextPlayer(PG);

    if (checkDealerRoundEndingCondition(PG)) {
      refreshDealerRound(PG);
      PG.actionRoundState = 0;
      return;
    }

    // this part will be replaced with showdown
    if (checkActionRoundEndingCondition(PG)) {
      // set the winning hand rank and its player index
      const winHandRank = showdown(PG);

      // give the player the pot and reset it to 0
      PG.playerObjectArray[winHandRank.playerIndex].stack += PG.pot;
      PG.pot = 0;

      // state the winner and how they won
      let outputStr = `Player ${PG.playerObjectArray[winHandRank.playerIndex].ID}`;
      outputStr += ` won with a ${rankToHandStr(winHandRank[0])}`;
      console.log(outputStr);

      // reset the dealer round
      refreshDealerRound(PG);
      PG.actionRoundState = 0;
      return;
    }

    outputGameStatus(PG);
    outputPlayerInquiry(PG);
  }
};

// INITIALIZATION CODE---------------------------------------------------------------------------------------

console.log('\nWelcome to PokerBirds!');

// set up Input Listener
process.stdin.resume();
process.stdin.addListener('data', handleCommandLineInput);

// query user for number of players
console.log('\nPlease enter the number of players, between 2 to 8:');

/* Big remaining tasks:

- showdown function (this is complete right?)
- side pot situation
- all-in before the last round

Small remaining tasks
- if player doesn't have enough for small or big blind
- cnsolidate actionRoundState 2 & 3?, but in 3 have a the showdown part?
- why are the the blinds reduced by 1cent??

NOTES-----------------------------------------------------------------------------------------------------

Simplify all notes before github

Something to think about for live game: how do we deal with bet increments. Let them do whatever they want?
Seems cleaner if there's a minimum chip increment but on the flip side not everything necessarily divides by
the small blind in real games. So for now I'm leaving it as is, with small blind being minimum chip size and big
blind being a multiple of it, but this is subject to change.

Something that would be nice for this game is telling the player WHY their input is invalid. However, since the
ultimate goal here is to make this a front-end app, we'll leave that for later.

BETTING RULES: "In no-limit hold 'em, players may bet or raise any amount over the minimum raise
up to all of the chips the player has at the table (called an all-in bet).
The minimum raise is equal to the size of the previous bet or raise.
If someone wishes to re-raise, they must raise at least the amount of the previous raise.
For example, if the big blind is $2 and there is a raise of $6 to a total of $8, a re-raise must be at least $6 more for a total of $14."

DONT FORGET THIS PART: "If a raise or re-raise is all-in and does not equal the size of the previous raise (or half the size in some casinos),
the initial raiser cannot re-raise again (in case there are other players also still in the game).
In pot-limit hold 'em, the maximum raise is the current size of the pot (including the amount needed to call)."

These are "all-in" scenarios that will need to be handled.

Further edge-cases: maybe some weird things happen if the buy-in is not a multiple of the small blind, but I haven't seen any places
where that would be an issue yet.

Edge case 1: scenario where the initial (previous?) raiser can now no longer re-raise unless someone else raises.
This is such an edge case that I will probably leave it out of this program, but it will be needed for the full game.

Edge case 2: P1 raises 500. P2 raises all-in for 700. The PG.minRaise is is still 500. P1 is not allowed to re-raise
unless another player re-raises (that's what the above comment references). But now, if P3 wants to re-raise, is the
minimum 1000 or 1200? Assuming 1200 for now.

*/
