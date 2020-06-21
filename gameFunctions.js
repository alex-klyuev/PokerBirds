
const showdown = (PG) => {

    for (let i = 0; i < PG.playerObjectArray.length; i++) {

        // for the players that remain, add a new object property consisting of that player's seven showdown cards
        if (PG.playerObjectArray[i].inGame) {
            let sevenCards = [...PG.board, ...PG.playerObjectArray[i].cards];
            console.log(sevenCards);
            bestHand(sevenCards);

        }
    }

};


const bestHand = (sevenCards) => {
    
    let currentCombination = [];
    currentCombination.length = 5; // just for you AK :)
    let combinations = [];
    
    // this function makes n choose k combinations of an input array of length n
    // and generates arrays of length k that constitute all combinations of the input 
    // array elements and returns an array of all those arrays. it's n choose k
    const combine = (inputArray, k, start) => {
        
        if (k === 0) {
            combinations.push(currentCombination.slice());
            return;
        }

        for (let i = start; i <= inputArray.length - k; i++) {
            currentCombination[5 - k] = inputArray[i];
            combine(inputArray, k - 1, i + 1);
        }
    }

    combine(sevenCards, 5, 0);
    console.log(combinations);
    console.log(`combinations.length=${combinations.length}`);

};



// the "build deck" function simply creates a new full deck. The deck array is global
const buildDeck = (PG) => {
    PG.deckArray = [];
    for (let i = 0; i < 13; i++) {
        let spadesCard = [i + 2, '♠'];
        let clubsCard = [i + 2, '♣'];
        let diamondCard = [i + 2, '♦'];
        let heartCard = [i + 2, '♥'];
        PG.deckArray.push(spadesCard, clubsCard, diamondCard, heartCard);
    }
};

// GAME FUNCTIONS--------------------------------------------------------------------------------------------


// this function assigns cards from the deck to players. Remaining deck is returned and player objects are
// updated accordingly. Only needs to run once at the beginning of each dealer round.
const dealCards = (PG) => {
    for (let i = 0; i < PG.playerObjectArray.length; i++) {
        for (let j = 0; j < 2; j++) {
            let randInt = randDeckArrayIdx(PG);
            PG.playerObjectArray[i].cards[j] = PG.deckArray[randInt];
            PG.deckArray.splice(randInt, 1);
        }
    }
};


// increments turn so that it can loop around the table
const incrementTurn = (PG) => {
    PG.turn++;
    PG.turn %= PG.playerObjectArray.length;
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


// takes a card out of the deck and adds it to the board next opening.
// will need to be called 3 times for the flop, once for turn and once for river.
const addToBoard = (PG) => {
    let randInt = randDeckArrayIdx(PG);
    for (let i = 0; i < 5; i++) {
        if (PG.board[i] === '') {
            PG.board[i] = PG.deckArray[randInt];
            PG.deckArray.splice(randInt, 1);
            return;
        }
    }
}


const flop = (PG) => {
    addToBoard(PG);
    addToBoard(PG);
    addToBoard(PG);
};


// takes in the card array of 2, and returns 1 string
const beautifyCard = (card) => {
    let num = card[0].toString();
    switch (num) {
        case '11':
            return 'J' + card[1];
        case '12':
            return 'Q' + card[1];
        case '13':
            return 'K' + card[1];
        case '14':
            return 'A' + card[1];
        default:
            return num + card[1];
    }
};


const randDeckArrayIdx = (PG) => Math.floor(Math.random() * PG.deckArray.length);


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
        outputLine1 = outputLine1 + 'P' + (i + 1).toString() + '      ';

        // since stack amount may vary, need to equalize the stack line to a total of 8 chars per player.
        let str = convertToDollars(PG.playerObjectArray[i].stack).toString();
        let spaces = '';
        for (let j = 0; j < (7 - str.length); j++) {
            spaces += ' ';
        }
        outputLine2 = outputLine2 + '$' + str + spaces;

        // show cards only for players that are still in the game
        if (PG.playerObjectArray[i].inGame) {
            outputLine3 = outputLine3 + '🂠🂠      ';
        } else {
            outputLine3 = outputLine3 + '        ';
        }

        // since action word length will vary, need to equalize line to 8 chars per player
        str = PG.playerObjectArray[i].actionState;
        spaces = '';
        for (let j = 0; j < (8 - str.length); j++) {
            spaces = spaces + ' ';
        }
        outputLine4 = outputLine4 + str + spaces;

        // since pot commitment will vary, need to equalize line to 8 chars per player
        if (PG.playerObjectArray[i].potCommitment === 0) {
            outputLine5 = outputLine5 + '        ';
        } else {
            str = convertToDollars(PG.playerObjectArray[i].potCommitment).toString();
            spaces = '';
            for (let j = 0; j < (7 - str.length); j++) {
                spaces = spaces + ' ';
            }
            outputLine5 = outputLine5 + '$' + str + spaces;
        }
    }

    // sixth line shows the board & seventh line shows the pot
    let outputLine6 = '\nBoard: ';
    if (PG.board[0] !== '') {
        outputLine6 = outputLine6 + '| ';
    }
    for (let i = 0; i < 5; i++) {
        if (PG.board[i] !== '') {
            outputLine6 = outputLine6 + beautifyCard(PG.board[i]) + ' | ';
        }
    }

    console.log(outputLine1);
    console.log(outputLine2);
    console.log(outputLine3);
    console.log(outputLine4);
    console.log(outputLine5);
    console.log(outputLine6);
    console.log('Pot: $' + convertToDollars(PG.pot).toString());
}


// output that comes under the board
const outputPlayerInquiry = (PG) => {
    console.log('\nPlayer ' + PG.playerObjectArray[PG.turn].ID + ', it\'s your turn.');
    console.log('Your cards: | ' + beautifyCard(PG.playerObjectArray[PG.turn].cards[0]) + ' | '
        + beautifyCard(PG.playerObjectArray[PG.turn].cards[1]) + ' |');
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
}


// Action round ending conditions fall into two categories: 
//  1. "No-raise": where there has been no raise and everyone checks or folds, or in the case of the pre-flop, 
//     calls, checks, or folds.
//  2. "Raise": where there is one remaining raiser and everyone else behind calls or folds.
const checkActionRoundEndingCondition = (PG) => {
    let actionCounter1 = 0;
    let actionCounter2 = 0;
    for (let i = 0; i < PG.playerObjectArray.length; i++) {

        // handles both pre-flop and post-flop "no raise" situations 
        if (PG.playerObjectArray[i].actionState === 'call' || PG.playerObjectArray[i].actionState === 'fold'
            || PG.playerObjectArray[i].actionState === 'check' || PG.playerObjectArray[i].actionState === '') {
            actionCounter1++;
        }

        // JJ-COMMENT: if else instead of two if statements?

        // handles "raise" situations
        if (PG.playerObjectArray[i].actionState === 'call' || PG.playerObjectArray[i].actionState === 'fold'
            || PG.playerObjectArray[i].actionState === '') {
            actionCounter2++;
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

// this function will end the dealer round when everyone except one person has folded. That person will win the pot.
// This is one of two ways a dealer round can end - the other is with a showdown that has its own function.
const checkDealerRoundEndingCondition = (PG) => {
    let dealerCounter = 0;
    let winnerIndex;
    for (let i = 0; i < PG.playerObjectArray.length; i++) {
        if (PG.playerObjectArray[i].actionState === 'fold' || PG.playerObjectArray[i].actionState === '') {
            dealerCounter++;
        } else {
            winnerIndex = i;
        }
    }

    if (dealerCounter === PG.playerObjectArray.length - 1) {
        // move pot to winner's stack
        PG.playerObjectArray[winnerIndex].stack += PG.pot;
        console.log(`\nPlayer ${PG.playerObjectArray[winnerIndex].ID} wins $${convertToDollars(PG.pot)}`);
        PG.pot = 0;
        return true;
    }

    // dealer round didn't end
    return false;
};


// this function restarts the following action round
const refreshActionRound = (PG) => {

    // clear pot commitment and action states; cards remain the same; reset PG.minraise
    for (let i = 0; i < PG.playerObjectArray.length; i++) {
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
    for (let i = 0; i < PG.playerObjectArray.length; i++) {
        if (PG.playerObjectArray[i].inGame) {
            PG.playerObjectArray[i].actionState = ' ';
        }
    }

    // allow checking at beginning of round
    PG.allowCheck = true;

    outputGameStatus(PG);
    outputPlayerInquiry(PG);
};


// this function restarts the following dealer round
const refreshDealerRound = (PG) => {

    // refresh all these variables. 
    for (let i = 0; i < PG.playerObjectArray.length; i++) {
        PG.playerObjectArray[i].potCommitment = 0;
        PG.playerObjectArray[i].actionState = '';
        PG.playerObjectArray[i].cards = [[], []];
        PG.playerObjectArray[i].inGame = true;

        // If a player lost their money, they stay out. Can clear them out completely later.
        // Doesn't really matter though because browser version will have option to buy back in, leave, etc.

        // DOUBLE CHECK THIS when showdown and side-pot parts are developed
        if (PG.playerObjectArray[i].stack === 0) {
            PG.playerObjectArray[i].inGame = false;
        }
    }

    // increment dealer
    PG.dealer++;
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

    // declare the dealer, output the first game board, and announce the first turn
    console.log('\nPlayer ' + PG.playerObjectArray[PG.dealer].ID + ' is the dealer.');
    outputGameStatus(PG);
    outputPlayerInquiry(PG);

};


// this function finds the next player that's still in the game and increments the turn to them
const findNextPlayer = (PG) => {
    // iterates starting from the current turn until it finds the next player that hasn't folded,
    // then breaks the loop
    for (let i = 0; i < PG.playerObjectArray.length; i++) {
        if (!PG.playerObjectArray[PG.turn].inGame) {
            incrementTurn(PG);
        } else {
            break;
        }
    }
};

module.exports = {
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
};
