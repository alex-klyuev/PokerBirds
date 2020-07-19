const { MAX_BUYIN_IN_CENTS } = require('./constants');
const {
    outputGameStatus,
    toCents,
    toDollars,
    outputLogsToConsole,
    rankToHandStr,
} = require('./utils');
const { Player } = require('./Player');
const { PokerGame } = require('./pokerGame');

/**
 * GENERAL NOTES
 * This game is made so that you can play with cents, which is a feature I want available in the end product.
 * For that reason, player inputs are converted to cents by multiplying everything by 100, and then divided by
 * 100 before logging back to the console. Open to changes on this front.
 */

const PG = new PokerGame();
let CLFState = 0;

// AUXILIARY COMMAND LINE FUNCTIONS: VALIDATE PLAYER INPUT AND THEN RETURN OBJECTS THAT ARE USED IN THE CLF

const validateNumPlayers = (input) => {
    // validation section
    if (input.length > 1 || input === '') {
        return { valid: false };
    }
    input = parseInt(input);
    if (input < 2 || input > 8) {
        return { valid: false };
    }

    return { valid: true, numPlayers: input };
};

const validateBuyIn = (inputBuyIn) => {
    inputBuyIn = parseInt(inputBuyIn);
    if (isNaN(inputBuyIn)) {
        return { valid: false };
    }
    return { valid: true, inputBuyIn };
};

const validateBlind = (inputBlind) => {
    inputBlind = parseFloat(inputBlind);
    if (isNaN(inputBlind)) {
        return { valid: false };
    }
    return { valid: true, inputBlind };
};

/**
 * Validate player action.
 *   if a call, check, fold or all-in, return { valid: true, playerAction: [respective string, ''] }
 *   if raise, return { valid: true, playerAction: 'raise', raiseAmount: raise amount in cents }
 */
const validateAndReturnPlayerAction = (input) => {
    let actionInput = input.slice(0, 4);
    let numericInput = input.slice(4);

    // some imperfect inputs are allowed in this game for the sake of simplicity of the code.
    // it's designed so that player intent is never misunderstood, however
    // this else if statement both validates the input and returns call, check, or fold if it's one of those.
    // if it's a raise, it goes on to the next section to validate the amount
    // player can always go all-in, so no validation needed
    switch(actionInput) {
        case 'all-':
            /* check notes
            if (!PG.currentPlayer.canRaise) {
            return { valid: false };
            } */
            return { valid: true, playerAction: 'all-in' };

        case 'call':
            if (PG.canCurrentPlayerCall()) {
                return { valid: true, playerAction: 'call' };
            } else {
                console.log('You cannot call here.');
                return { valid: false };
            }

        case 'fold':
            return { valid: true, playerAction: 'fold' };

        case 'chec':
            if (!PG.canCurrentPlayerCheck()) {
                console.log('You cannot check here.');
                return { valid: false };
            } else {
                return { valid: true, playerAction: 'check' };
            }

        case 'bet ':
            let cents = toCents(parseFloat(numericInput));
            if (!PG.canCurrentPlayerRaise()) {
                return { valid: false };
            } else if (!PG.canCurrentPlayerRaiseBy(cents)) {
                console.log(`You can't raise that amount.`);
                return { valid: false };
            } else {
                return { valid: true, playerAction: 'raise', raiseAmount: cents };
            }

        default:
            return { valid: false };
    }
}



// COMMAND LINE FUNCTION (CLF) -------------------------------------------------------------------------------

const handleCommandLineInput = (input) => {
    input = input.toString().substring(0, input.length - 1);
    if (input.slice(0, 4) === 'exit') {
        process.exit();
    }

    /**
     * CLFState:
     *  0-4 (inclusive) is the PRE-GAME (at the Bird House on Friday). Runs once before the game begins.
     *  5 runs the actual Poker Game.
     */
    switch(CLFState) {
        // validate number of players and create players
        case 0: {
            let result = validateNumPlayers(input);
            if (!result.valid) {
                console.log('Please enter a valid number: 0 < numPlayers < 9');
                return;
            }

            // add players
            for (let i = 0; i < result.numPlayers; i++) {
                PG.addPlayerToPosition(new Player(i, PG.buyIn, PG), i);
            }

            // console logs for next block needs to occur within previous if statement
            CLFState++;
            console.log(`\nWelcome to the game, players 0 through ${PG.players.length - 1}. Here are the game settings:`);
            console.log('Buy-ins must be in dollar increments. Blinds and bets can be in increments of cents,');
            console.log('but be sure to input them as decimals. The small blind will be the smallest chip size,');
            console.log('so the big blind and all bets must be multiples of that. The minimum buy-in is 20 times the big blind,');
            console.log(`and the maximum is $${toDollars(MAX_BUYIN_IN_CENTS)}. Now, without further ado - what will your buy-in be?`);
            return;
        }
        // validate and set buy-in
        case 1: {
            let result = validateBuyIn(input);
            if (!result.valid) {
                console.error('Please enter a valid buy-in: $0 < buy-in <= $1000');
                return;
            }

            if (!PG.setBuyIn(toCents(result.inputBuyIn))) {
                return;
            }

            // set each player's stack to the buy-in
            PG.players.forEach((player) => player.stack = PG.buyIn);

            // iterate state and ask next question
            CLFState++;
            console.log('What will the small blind be?');
            return;
        }
        // validate and set small blind
        case 2: {
            let result = validateBlind(input);
            if (!result.valid) {
                console.error('Please enter a valid small blind: $0 < SB, and SB <= buy-in / 20');
                return;
            }

            if (!PG.setSmallBlind(toCents(result.inputBlind))) {
                return;
            }

            CLFState++;
            console.log('What will the big blind be?');
            return;
        }
        // validate and set big blind, set global variables, and start dealer round
        case 3: {
            let result = validateBlind(input);
            if (!result.valid) {
                console.error('Please enter a valid big blind: (BB % SB) = 0, BB >= SB, and BB <= buy-in / 20');
                return;
            }

            if (!PG.setBigBlind(toCents(result.inputBlind))) {
                return;
            }

            // START DEALER ROUND
            // "Dealer round": overall entire round from pre-flop to showdown, since dealer changes from round to round.
            // "Action round": individual round within dealer round tracked by PG.actionRound:
            //   1. Pre-flop, 2. Flop, 3. Turn, 4. River

            // Below block only needs to run once at the beginning of each dealer round: everything until action after the big blind.
            console.log(`\nGreat! Let's begin the game. Here are the game rules:`);
            console.log(`To raise, enter "bet" followed by a space and the total amount you'd like to bet (no dollar signs).`);
            console.log(`In the case of a re-raise, make sure you input the total amount you are raising to, not just the raise amount.`);
            console.log(`To call, check, or fold, simply enter "call", "check", or "fold". To go all-in, even as a call, type`);
            console.log(`"all-in". The first dealer will be picked randomly.`);

            // Pick random player to begin as the first dealer. Actually, dealer will be randDealer + 1 below because
            // PG.refreshDealerRound() will make dealer be the next. Doesn't matter though cause game hasn't yet started.
            let randDealer = Math.floor(Math.random() * PG.numPlayers);
            PG.setDealer(randDealer);
            PG.refreshDealerRound();

            // declare the dealer, output the first game board, and announce the first turn and return
            outputLogsToConsole(PG);

            CLFState++; // CLFState will never be used again. RIP
            return;
        }
    }


    // Handle the 4 action rounds. From now on, code will cycle between these 4 action rounds for each dealer round.
    // TODO(anyone): Can merge preflop thru turn with river
    switch(PG.actionRoundStr) {
        case 'pre-flop':
        case 'flop':
        case 'turn': {
            let result = validateAndReturnPlayerAction(input);
            if (!result.valid) {
                console.log('Please enter a valid input.');
                return;
            }

            // Call method corresponding to current player action
            PG.callCurrentPlayerAction(result);

            // increment turn and find the next player still in the game
            PG.incrementTurn();
            PG.incrementTurnToNextPlayerInGame();

            // Check special conditions during preflop
            if (PG.actionRoundStr === 'pre-flop') {
                PG.preflopAllowCheckForSBAndOrBB();
            }

            // Checking if dealer round is done comes before action round because of edge case where one player checks
            // and all others fold.
            if (PG.dealerRoundEnded()) {
                let drResult = PG.getDealerRoundInfoAndAddPotToDealerRoundWinner();

                // set everything through the blinds up for next round and output to the board
                console.log(`\nPlayer ${PG.players[drResult.winnerIdx].id} wins $${toDollars(drResult.winnings)}`);
                PG.refreshDealerRound();

                // declare the dealer, output the first game board, and announce the first turn
                console.log(`\nPlayer ${PG.players[PG.dealerIdx].id} is the dealer.`);

            } else if (PG.actionRoundEnded()) {
                let arResult = PG.getActionRoundInfo();
                console.log(`action round ended via ${arResult.scenario} scenario`);
                PG.refreshAndIncActionRound(); // PG.actionRoundStr will change to what's the current actionRoundStr
                PG[PG.actionRoundStr](); // calls PG.flop(), PG.turn() or PG.river()
            }

            break;
        }
        case 'river': {
            let result = validateAndReturnPlayerAction(input);
            if (!result.valid) {
                console.log('Please enter a valid input.');
                return;
            }

            PG.callCurrentPlayerAction(result);
            PG.incrementTurn();
            PG.incrementTurnToNextPlayerInGame();

            if (PG.dealerRoundEnded()) {
                let drResult = PG.getDealerRoundInfoAndAddPotToDealerRoundWinner();
                console.log(`\nPlayer ${PG.players[drResult.winnerIdx].id} wins $${toDollars(drResult.winnings)}`);
                PG.refreshDealerRound();
                console.log(`\nPlayer ${PG.players[PG.dealerIdx].id} is the dealer.`);

            } else if (PG.actionRoundEnded()) {
                PG.showdown();

                // output winner(s) and winning hand(s)
                PG.winHandRanks.forEach(rank => {
                    // state the winner and how they won
                    console.log(`Player ${PG.players[rank.playerIndex].id} won with a ${rankToHandStr(rank[0])}`);
                });

                PG.refreshDealerRound();
                // declare the dealer, output the first game board, and announce the first turn
                console.log(`\nPlayer ${PG.players[PG.dealerIdx].id} is the dealer.`);
            }
            break;
        }
    }

    outputLogsToConsole(PG);
    return;
};


// COMMAND LINE INITIALIZATION CODE ---------------------------------------------------------------------------------------
console.log('\nWelcome to PokerBirds!');

// set up Input Listener
process.stdin.resume();
process.stdin.addListener('data', handleCommandLineInput);

// query user for number of players
console.log('\nPlease enter the number of players, between 2 to 8:');


/*
Big remaining tasks:
- showdown function
- side pot situation
- all-in before the last round

Small remaining tasks
- if player doesn't have enough for small or big blind
- consolidate actionRound 2 & 3?, but in 3 have the showdown part?


NOTES -----------------------------------------------------------------------------------------------------

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
