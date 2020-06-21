const assert = require('assert');

const { PokerGame } = require('./PokerGame');
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
} = require('./gameFunctions');

const { Player } = require('./Player');

// Tests

// testing showdown 1
const PG = new PokerGame();

for (let i = 0; i < 2; i++) {
    PG.playerObjectArray.push(new Player(i + 1));
}

buildDeck(PG);
assert(PG.deckArray.length === 52);

dealCards(PG);
for (let i = 0; i < PG.playerObjectArray.length; i++) {
    console.log(PG.playerObjectArray[i].cards);
    // assert(PG.playerObjectArray[i].cards.length === 2);
}



flop(PG);
addToBoard(PG);
addToBoard(PG);
assert(PG.board.length === 5);

showdown(PG);
for (let i = 0; i < PG.playerObjectArray.length; i++) {
    //console.log(PG.playerObjectArray[i].showdownCards);
    //assert(PG.playerObjectArray[i].showdownCards.length === 7);
}

