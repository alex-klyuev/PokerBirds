const assert = require('assert');
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
    straightFlush,
    returnHandRank,
    rankToHandStr,
} = require('./gameFunctions');
const { PokerGame } = require('./PokerGame');
const { Player } = require('./Player');

// Tests

// Showdown Test 1
const showdownTest1 = () => {
    const PG = new PokerGame();

    for (let i = 0; i < 2; i++) {
        PG.playerObjectArray.push(new Player(i + 1));
    }

    buildDeck(PG);
    assert(PG.deckArray.length === 52);

    dealCards(PG);
    for (let i = 0; i < PG.playerObjectArray.length; i++) {
        assert(PG.playerObjectArray[i].cards.length === 2);
    }

    flop(PG);
    addToBoard(PG);
    addToBoard(PG);
    assert(PG.board.length === 5);

    showdown(PG);
    for (let i = 0; i < PG.playerObjectArray.length; i++) {
        assert(PG.playerObjectArray[i].showdownRank.length === 6);
    }
}

showdownTest1();

// Testing hand functions ♠ ♣ ♦ ♥

let hand = [[9, '♠'], [8, '♠'], [12, '♠'], [11, '♠'], [10, '♠']];
// console.log(returnRankArray(hand));

hand = [[14, '♠'], [5, '♠'], [4, '♠'], [3, '♠'], [2, '♠']];
// console.log(returnRankArray(hand));

hand = [[13, '♠'], [13, '♥'], [13, '♦'], [13, '♣'], [8, '♠']];
// console.log(returnRankArray(hand));

hand = [[12, '♠'], [12, '♥'], [8, '♦'], [8, '♣'], [8, '♠']];
// console.log(returnRankArray(hand)); 

hand = [[9, '♠'], [4, '♠'], [3, '♠'], [14, '♠'], [8, '♠']];
// console.log(returnRankArray(hand)); 

hand = [[5, '♣'], [3, '♦'], [14, '♥'], [4, '♠'], [2, '♠']];
// console.log(returnRankArray(hand)); 

hand = [[12, '♠'], [11, '♥'], [11, '♦'], [11, '♣'], [8, '♠']];
// console.log(returnRankArray(hand)); 

hand = [[4, '♠'], [3, '♥'], [10, '♦'], [4, '♣'], [3, '♠']];
// console.log(returnRankArray(hand)); 

hand = [[8, '♠'], [8, '♥'], [14, '♦'], [6, '♣'], [3, '♠']];
// console.log(returnRankArray(hand));

hand = [[4, '♠'], [8, '♥'], [14, '♦'], [6, '♣'], [3, '♠']];
// console.log(returnRankArray(hand)); */


const runMonteCarlo = () => {
    const returnIfHandWasObtained = (inputRank) => {
        const PG = new PokerGame();
    
        for (let i = 0; i < 1; i++) {
            PG.playerObjectArray.push(new Player(i + 1));
        }
    
        buildDeck(PG);
        assert(PG.deckArray.length === 52);
    
        dealCards(PG);
        for (let i = 0; i < PG.playerObjectArray.length; i++) {
            assert(PG.playerObjectArray[i].cards.length === 2);
        }
    
        flop(PG);
        addToBoard(PG);
        addToBoard(PG);
        assert(PG.board.length === 5);
        showdown(PG);
    
        for (let i = 0; i < PG.playerObjectArray.length; i++) {
            assert(PG.playerObjectArray[i].showdownRank.length === 6);
        }
    
        return PG.playerObjectArray[0].showdownRank[0] === inputRank;
    };

    const straightFlushRank = 8;
    const singlePair = 2;

    let totalCounter = 0;
    let totalTime = 0;
    for (let i = 0; i < 1000; i++) {
    
        let obtainedHand = false
        let counter = 0;
        let start = new Date().getTime();
        while (!obtainedHand) {
            obtainedHand = returnIfHandWasObtained(singlePair);
            counter++;
        }
    
        let finish = new Date().getTime();
        totalCounter += counter;
        totalTime += finish - start;
    
        // console.log(`Total time to get a high card ${finish - start}`);
        // console.log(`This bad ass motherfucker looped ${counter} times baby`);
    }
    
    let avgTime = totalTime / 1000;
    let avgCounter = totalCounter / 1000;
    let prob = 100 * 1 / avgCounter;
    console.log(`Average time was ${avgTime}`);
    console.log(`Average # of loops was ${avgCounter}`);
    console.log(`The probability of getting ${rankToHandStr(singlePair)} is ${prob}%`);

};

runMonteCarlo();
