const ranksEqual = (r1, r2) => {
    if (r1 === r2) return true;
    if (r1 == null || r2 == null) return false;
    if (r1.length !== r2.length) return false;
    for (var i = 0; i < r1.length; ++i) {
        if (r1[i] !== r2[i]) return false;
    }
    return true;
};

const bestHandRank = (sevenCards) => {
    let currentCombination = [];
    currentCombination.length = 5; // just for you AK :)
    let handCombinations = [];

    // this function makes n choose k combinations of an input array of length n
    // and generates arrays of length k that constitute all combinations of the input 
    // array elements and returns an array of all those arrays. it's n choose k
    const combine = function(inputArray, k, start) {
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
    let handRanks = [];
    for (let i = 0; i < handCombinations.length; i++) {
        let handRank = getHandRank(handCombinations[i]);
        handRanks.push(handRank);
    }

    return pickSingleBestHandRank(handRanks);
};


const pickSingleBestHandRank = (handRanks) => {
    // sort the hand ranks and return the best ones
    handRanks.sort((rank1, rank2) => {
        for (let i = 0; i < rank1.length; i++) {
            if (rank2[i] - rank1[i] !== 0) {
                return rank2[i] - rank1[i];
            }
        }
    });
    return handRanks[0];
};

// TODO(anyone): Test this function
const pickBestHandRanks = (handRanks) => {
    // sort the hand ranks and return the best ones
    handRanks.sort((rank1, rank2) => {
        for (let i = 0; i < rank1.length; i++) {
            if (rank2[i] - rank1[i] !== 0) {
                return rank2[i] - rank1[i];
            }
        }
    });

    // get how many same handRanks there are starting from comparing
    //   handRanks[0] with handRanks[1],
    //   handRanks[1] with handRanks[2], ...
    // that will give you an index for handRanks to slice until, through which each handRank from 0 to that idx is the same
    // as the previous
    let numWinRanks = 1;
    while (numWinRanks < handRanks.length && ranksEqual(handRanks[numWinRanks - 1], handRanks[numWinRanks])) {
        numWinRanks++;
    }

    // get all handRanks equal to the first handRank
    let winRanks = handRanks.slice(0, numWinRanks);

    // get all unique playerIndexes from winRanks
    let s = new Set();
    let uniquePlayerWinRanks = [];
    winRanks.forEach((rank) => {
        if (!s.has(rank.playerIndex)) {
            s.add(rank.playerIndex);
            uniquePlayerWinRanks.push(rank);
        }
    });
    return uniquePlayerWinRanks;
};


const straightFlush = (hand) => {
    // check for flush; if not, function is broken immediately
    for (let i = 1; i <= 4; i++) {
        if (hand[i][1] !== hand[0][1]) {
            return null;
        }
    }

    // check for wheel straight (A -> 5)
    let wheelCounter = 0;
    if (hand[0][0] === 14) {
        for (let i = 1; i <= 4; i++) {
            if (hand[i][0] === 6 - i) {
                wheelCounter++;
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
    return [8, hand[0][0], 0, 0, 0, 0]
};


const fourOfAKind = (hand) => {
    let freqMap = makeFreqMap(hand);

    // make a specific object for the value of the 4 and the kicker
    let rankObj = {};
    for (let num in freqMap) {
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
    let freqMap = makeFreqMap(hand);

    // make a specific object for value of the 3 and the pair
    let rankObj = {};
    for (let num in freqMap) {
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
    let flushArray = [];
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
    let freqMap = makeFreqMap(hand);

    // make a specific object for value of the 3
    let rankObj = {};
    for (let num in freqMap) {
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
    let freqMap = makeFreqMap(hand);

    // make a specific object for the values of both pairs (in an array
    // to be sorted later) and the kicker
    let rankObj = {
        pairValArray: [],
    };
    let pairCounter = 0;
    for (let num in freqMap) {
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
    let freqMap = makeFreqMap(hand);

    // make a specific object for value of the pair
    let rankObj = {};
    for (let num in freqMap) {
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
    let highCardArray = [];
    for (let i = 0; i < 5; i++) {
        highCardArray.push(hand[i][0]);
    }
    return [0, ...highCardArray];
};


/**
 * Create an array of all the hand functions to iterate through in getHandRank
 * Important! Its order matters, as it's used to iterate from 0 –> 8 and whichever handFunction call returns a non-null
 * value will be set as the rank for a hand.
 */
const handFunctions = [straightFlush, fourOfAKind, fullHouse, flush, straight,
    threeOfAKind, twoPair, pair, highCard];


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
const getHandRank = (hand) => {
    // sort hand by number rank from greatest to lowest
    hand.sort((card1, card2) => card2[0] - card1[0]);

    // iterate through the handFunctions and return the hand
    for (i = 0; i < handFunctions.length; i++) {
        let handRank = handFunctions[i](hand);
        if (handRank !== null) {
            return handRank;
        }
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
    for (let i = 0; i < PG.numPlayers; i++) {

        // P1, P2, etc.
        outputLine1 = outputLine1 + 'P' + i.toString() + '      ';

        // since stack amount may vary, need to equalize the stack line to a total of 8 chars per player.
        let str = toDollars(PG.players[i].stack).toString();
        let spaces = '';
        for (let j = 0; j < (7 - str.length); j++) {
            spaces += ' ';
        }
        outputLine2 = outputLine2 + '$' + str + spaces;

        // show cards only for players that are still in the game
        if (PG.players[i].inGame) {
            outputLine3 = outputLine3 + '🂠🂠      ';
        } else {
            outputLine3 = outputLine3 + '        ';
        }

        // since action word length will vary, need to equalize line to 8 chars per player
        str = PG.players[i].actionState;
        spaces = '';
        for (let j = 0; j < (8 - str.length); j++) {
            spaces = spaces + ' ';
        }
        outputLine4 = outputLine4 + str + spaces;

        // since pot commitment will vary, need to equalize line to 8 chars per player
        if (PG.players[i].potCommitment === 0) {
            outputLine5 = outputLine5 + '        ';
        } else {
            str = toDollars(PG.players[i].potCommitment).toString();
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
    console.log('Pot: $' + toDollars(PG.pot).toString());
};


// output that comes under the board
const outputPlayerInquiry = (PG) => {
    console.log('\nPlayer ' + PG.currentPlayer.id + ', it\'s your turn.');
    console.log('Your cards: | ' + beautifyCard(PG.currentPlayer.cards[0]) + ' | '
        + beautifyCard(PG.currentPlayer.cards[1]) + ' |');
    console.log(`Min bet: $${toDollars(PG.previousBet + PG.minRaise)} \n`);
};

// helper function to not have to make 2 calls all the time in game.js
const outputLogsToConsole = (PG) => {
    outputGameStatus(PG);
    outputPlayerInquiry(PG);
};


// make it easier to keep track where this is done
const toDollars = (value) => value / 100;
const toCents = (value) => value * 100;


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

const rankToHandStr = (rank) => {
    switch(rank) {
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

// make an object where each card number is the key, and the amount of times
// that card number appears in the hand is that key's value
const makeFreqMap = (hand) => {
    let freqMap = {};
    hand.forEach((card) => {
        let num = card[0];
        freqMap[num] = freqMap[num] || 0;
        freqMap[num]++;
    })
    return freqMap;
};


module.exports = {
    bestHandRank,
    pickBestHandRanks,
    getHandRank,
    outputGameStatus,
    outputPlayerInquiry,
    outputLogsToConsole,
    toDollars,
    toCents,
    straightFlush,
    rankToHandStr,
    beautifyCard,
    makeFreqMap,
};
