const {
    MAX_BUYIN_IN_CENTS,
    MAX_PLAYERS_PER_GAME,
    NUM_CARDS_PER_PLAYER,
    toDollars,
    bestHandRank,
    pickBestHandRank,
    beautifyCard,
} = require('./utils');

// TODO(anyone): removePlayer
// TODO(anyone): standupPlayer
class PokerGame {
    constructor() {
        // Once buyIn, SB and BB are initialized, will be changed to true.
        this.initialized = false;
        // Below constants should remain the same once initialized. Monetary values are in cents.
        this.buyIn = -1;
        this.smallBlind = -1;
        this.bigBlind = -1;

        this.players = [];

        // Game state variables that change per action & dealer round. Monetary values are in cents.
        this.dealer = 0;
        this.turn = 0;
        // TODO(anyone): Change pot to totalPot and create an actionRoundPot to display both?
        this.pot = 0;
        this.actionRoundState = 0; // 0 = pre-flop, 1 = flop, 2 = turn, 3 = river
        this.board = ['', '', '', '', ''];
        this.deck = [];
        this.minRaise = 0;
        this.previousBet = 0;
        // indicates whether previous action was a check (allowCheck = true), allowing for following player to check.
        // starts this way automatically at beginning of flop, turn, and river. A raise by any player will 
        // toggle the state to false for the rest of the round. Is also toggled for the big blind pre-flop and small blind
        // if SB = BB.
        this.allowCheck = false;
    }

    throwIfNotInitialized() {
        if (!this.initialized) {
            throw new Error(`Haven't initialized buyIn=${this.buyIn}, smallBlind=${this.smallBlind}, bigBlind=${this.bigBlind}`);
        }
    }

    /**
     * 1st value that needs to be set. Value has to be <= utils.MAX_BUYIN_IN_CENTS.
     * @param val number potential buy-in in cents
     * @return boolean whether operation succeeded
     */
    setBuyIn(val) {
        if (val < 1 || val > MAX_BUYIN_IN_CENTS) {
            console.error(`Cannot initialize buy-in=${val}. Should be 1 <= val <= ${toDollars(MAX_BUYIN_IN_CENTS)}.`);
            return false;
        }

        this.buyIn = val;
        return true;
    }

    /**
     * 2nd value that needs to be set. Sets the SB. Needs to be set before setting BB.
     * @param val number SB value in cents
     * @return boolean whether operation succeeded
     * TODO(anyone): Add functionality to be able to increase/decreate SB/BB?
     */
    setSmallBlind(val) {
        if (val <= 0) {
            console.error(`Cannot initialize SB with value of ${val}. Value needs to be > 0.`);
            return false;
        }
        if (this.buyIn === -1) {
            console.error(`Cannot initialize SB because buy-in has not been set.`);
            return false;
        }
        if (val > this.buyIn / 20) {
            console.error(`Cannot initialize SB with value greater than buyIn/20.`);
            return false;
        }
        this.smallBlind = val;
        this.bigBlind = -1;
        return true;
    }

    /**
     * 3rd value that needs to be set. Sets the BB. Note, SB and buy-in need to be set first.
     * @param val number potential BB in cents
     * @return boolean whether operation succeeded
     * TODO(anyone): Add functionality to be able to increase/decreate SB/BB?
     */
    setBigBlind(val) {
        if (this.smallBlind === -1) {
            console.error('Cannot initialize BB. Need to initialize SB first.');
            return false;
        }
        if (val < this.smallBlind) {
            console.error('Cannot initialize BB with value less than SB.');
            return false;
        }
        if (val % this.smallBlind !== 0) {
            console.error('Cannot initialize BB. Must be a multiple of SB.');
            return false;
        }
        if (val > this.buyIn / 20) {
            console.error(`Cannot initialize BB with value greater than the buyIn/20.`);
            return false;
        }

        this.bigBlind = val;
        this.initialized = true;
        return true;
    }

    setDealer(idx) {
        if (idx < 0 || idx >= this.numPlayers) {
            console.error(`Cannot set dealer to be ${idx}`);
            return;
        }
        this.dealer = idx;
    }

    isPositionAvailable(pos) {
        return this.players[pos] === undefined;
    }

    /**
     * Adds a player to a position, i.e. players array index
     * @param player that will be added
     * @param pos array index where player will be attempted to be placed
     */
    addPlayerToPosition(player, pos) {
        if (!this.isPositionAvailable(pos)) {
            console.error(`Cannot add player. Player already sitting at position ${pos}.`);
            return;
        }
        if (this.numPlayers === MAX_PLAYERS_PER_GAME) {
            console.error(`Cannot add player. Already have max players (${MAX_PLAYERS_PER_GAME}).`);
            return;
        }
        this.players[pos] = player;
    }

    get numPlayers() {
        return this.players.length;
    }

    // create a new full numerically-sorted deck
    buildDeck() {
        this.deck = [];
        // 2, 3, 4, 5, 6, 7, 8, 9, 10, J (11), Q (12), K (13), A (14)
        for (let i = 2; i <= 14; i++) {
            let spadesCard = [i, '♠'], clubsCard = [i, '♣'], diamondCard = [i, '♦'], heartCard = [i, '♥'];
            this.deck.push(spadesCard, clubsCard, diamondCard, heartCard);
        }
    }

    // increment turn and loop around the table if necessary
    incrementTurn() {
        this.throwIfNotInitialized();

        this.turn++;
        this.turn %= this.numPlayers;
    }

    // find the next player still in the game and increment the turn to them
    incrementTurnToNextPlayerInGame() {
        this.throwIfNotInitialized();

        // Iterates starting from the current turn until it finds the next player that hasn't folded,
        // then breaks the loop
        for (let i = 0; i < this.numPlayers; i++) {
            if (!this.currentPlayer.inGame) {
                this.incrementTurn();
            } else {
                break;
            }
        }
    }

    // assign 2 cards from the deck to each player
    // only needs to run once at the beginning of each dealer round
    dealCards() {
        this.players
            .filter((player) => player.inGame)
            .forEach((player) => {
                for (let i = 0; i < NUM_CARDS_PER_PLAYER; i++) {
                    let randInt = this.randDeckIdx();
                    player.cards[i] = this.deck[randInt];
                    this.deck.splice(randInt, 1);
                }
            });
    }

    // TODO(anyone): Check that players are inGame or not before having them post blinds
    postBlinds() {
        this.throwIfNotInitialized();

        // post small blind
        this.minRaise = 0;
        this.previousBet = 0;
        this.currentPlayer.raise(this.smallBlind);
        this.currentPlayer.actionState = 'SB';
        this.incrementTurn();

        // post big blind; vars are set to 0 to allow a raise (so that later bb can check at the end of pre-flop)
        this.minRaise = 0;
        this.previousBet = 0;
        this.currentPlayer.raise(this.bigBlind);
        this.currentPlayer.actionState = 'BB';
        this.incrementTurn();
        this.minRaise = this.bigBlind;
        this.previousBet = this.bigBlind;
        this.allowCheck = false;
    };

    addToBoard = () => {
        this.throwIfNotInitialized();

        let randInt = this.randDeckIdx();
        for (let i = 0; i < 5; i++) {
            if (this.board[i] === '') {
                this.board[i] = this.deck[randInt];
                this.deck.splice(randInt, 1);
                return;
            }
        }
    }

    flop() {
        this.addToBoard();
        this.addToBoard();
        this.addToBoard();
    };

    turn() {
        this.addToBoard();
    }

    river() {
        this.addToBoard();
    }

    /**
     * Idempotent method. Action round ending conditions fall into two categories:
     *  1. "No-raise": where there has been no raise and everyone checks or folds, or in the case of the pre-flop,
     *     calls, checks, or folds.
     *  2. "Raise": where there is one remaining raiser and everyone else behind calls or folds.
     * @returns {
     *    ended (boolean): whether action round ended,
     *    scenario (string): "raise" or "no-raise"
     * }
     */
    getActionRoundInfo() {
        this.throwIfNotInitialized();

        let actionCounter1 = 0;
        let actionCounter2 = 0;

        this.players.forEach((player) => {
            // handles both pre-flop and post-flop "no raise" situations
            if (player.actionState === 'call' || player.actionState === 'fold'
                || player.actionState === 'check' || player.actionState === '') {
                actionCounter1++;
            }
            // handles "raise" situations
            if (player.actionState === 'call' || player.actionState === 'fold'
                || player.actionState === '') {
                actionCounter2++;
            }
        });

        // can be combined later
        // no-raise scenario
        if (actionCounter1 === this.numPlayers) {
            return { ended: true, scenario: 'no-raise' }; // free cards smh cod clam it
        }

        // raise scenario
        if (actionCounter2 === this.numPlayers - 1 && this.currentPlayer.actionState === 'raise') {
            return { ended: true, scenario: 'raise' }; // no free cards baby!
        }

        // action round ending conditions not met
        return { ended: false };
    }

    /**
     * Not idempotent method. TODO(anyone) Make idempotent
     * Ends the dealer round when everyone except one person has folded. That person will win the pot.
     * This is one of two ways a dealer round can end - the other is with a showdown that has its own function.
     * @returns {
     *    ended (boolean): whether dealer round ended,
     *    winnerIndex? (optional number),
     *    potWinnings? (optional number)
     * }
     */
    getDealerRoundInfo() {
        this.throwIfNotInitialized();

        let dealerCounter = 0;
        let winnerIndex;

        this.players.forEach((player, idx) => {
            if (player.actionState === 'fold' || player.actionState === '') {
                dealerCounter++;
            } else {
                winnerIndex = idx;
            }
        });

        if (dealerCounter === this.numPlayers - 1) {
            // move pot to winner's stack
            this.players[winnerIndex].stack += this.pot;
            let potWinnings = this.pot;
            this.pot = 0;
            return {
                ended: true,
                winnerIndex,
                potWinnings,
            };
        }

        // dealer round didn't end
        return { ended: false };
    }

    // restart the following action round
    refreshActionRound() {
        this.throwIfNotInitialized();

        // clear pot commitment and action states; cards remain the same; reset this.minRaise; allow check
        this.players.forEach((player) => {
            player.potCommitment = 0;
            player.actionState = '';
            player.canRaise = true;
        });
        this.previousBet = 0;
        this.minRaise = this.bigBlind;
        this.allowCheck = true;

        // action rounds begins with the small blind
        this.turn = this.dealer;
        this.incrementTurn(); // TODO(anyone): Is this incrementTurn() necessary?
        this.incrementTurnToNextPlayerInGame();

        // hacky way of setting players to still be in the action round so that the ending condition
        // functions don't immediately read the turn as over at the beginning of the round (could probably
        // be improved to be more clear). Still a blank string so that nothing is output to the board
        for (let i = 0; i < this.numPlayers; i++) {
            if (this.players[i].inGame) {
                this.players[i].actionState = ' ';
            }
        }
    };

    // restart the following dealer round
    refreshDealerRound() {
        this.throwIfNotInitialized();

        // refresh all of these variables
        this.players.forEach((player) => {
            player.potCommitment = 0;
            player.actionState = '';
            player.cards = [[], []];
            player.inGame = true;
            player.canRaise = true;

            // If a player lost their money, they stay out. Can clear them out completely later.
            // Doesn't really matter though because browser version will have option to buy back in, leave, etc.

            // DOUBLE CHECK THIS when showdown and side-pot parts are developed
            if (player.stack === 0) {
                player.inGame = false;
            }
        });

        // clear the board, build a new full deck, and deal cards to the players
        this.board = ['', '', '', '', ''];
        this.buildDeck();
        this.dealCards();

        // increment dealer and loop around players array
        this.dealer++;
        this.dealer %= this.numPlayers;

        // set turn to small blind, next after dealer
        this.turn = this.dealer;
        this.incrementTurn();

        this.postBlinds();
    }

    // TODO(anyone): Improve this method
    showdown() {
        this.throwIfNotInitialized();

        let showdownHandRanks = [];

        this.players.forEach((player, idx) => {
            if (player.inGame) {
                let sevenCards = [...this.board, ...player.cards];

                // take player's seven showdown cards and return the rank of the best five cards
                player.showdownRank = bestHandRank(sevenCards);
                player.showdownRank.playerIndex = idx; // just for you AK ;)
                showdownHandRanks.push(player.showdownRank);
            }
        });

        // returns the best hand rank and its player index
        return pickBestHandRank(showdownHandRanks);
    }

    get currentPlayer() {
        return this.players[this.turn];
    }

    canCurrentPlayerCall() {
        this.throwIfNotInitialized();

        // validate that there is a raise on the board to be called. Second part is to allow the SB to call
        // when it is not equal to the big blind

        let raiseCounter = 0;
        for (let i = 0; i < this.numPlayers; i++) {
            // this allows the small blind to call big blind as well
            if (this.players[i].actionState === 'raise' || (this.players[i].actionState === 'SB')) {
                raiseCounter++;
            }
        }

        // exception for situation where small blind is equal to big blind; SB cannot call there
        if (raiseCounter === 0 || this.currentPlayer.actionState === 'SB' && this.smallBlind === this.bigBlind) {
            return false;
        } else {
            return true;
        }
    }

    canCurrentPlayerRaiseBy(cents) {
        this.throwIfNotInitialized();

        // second input: check all-in edge case scenario,
        // verify that the raise is an increment of the small blind, equal or above the minimum raise,
        // and less than or equal to the player's stack. exception is made if player bets stack; then bet gets through
        // regardless of the min raise.
        if (!this.currentPlayer.canRaise) {
            return false;
        }

        if (cents === this.currentPlayer.stack) {
            return true;
        }
        if (cents % this.smallBlind !== 0 ||
            cents < this.previousBet + this.minRaise ||
            cents > this.currentPlayer.stack + this.currentPlayer.potCommitment) {
            return false;
        }

        return true;
    }

    randDeckIdx() {
        return Math.floor(Math.random() * this.deck.length);
    }

    toString() {
        let str = `PokerGame {\n` +
        `  initialized: ${this.initialized},\n` +
        `  buyIn: ${toDollars(this.buyIn)},\n` +
        `  smallBlind: ${toDollars(this.smallBlind)},\n` +
        `  bigBlind: ${toDollars(this.bigBlind)},\n` +
        `  dealer: ${this.dealer},\n` +
        `  turn: ${this.turn},\n` +
        `  pot: ${toDollars(this.pot)},\n` +
        `  actionRoundState: ${this.actionRoundState},\n` +
        `  board: ${this.board},\n` +
        `  minRaise: ${toDollars(this.minRaise)},\n` +
        `  previousBet: ${toDollars(this.previousBet)},\n` +
        `  allowCheck: ${this.allowCheck},\n`;

        let deckStr = `  deck: ${this.deck.map((card, idx) => {
            if (idx === 0) {
                return '[\n    ' + beautifyCard(card) + ',\n';
            } else if (idx === this.players.length - 1) {
                return '   ' + beautifyCard(card) + '\n  ]';
            } else {
                return '   ' + beautifyCard(card) + ',\n';
            }
        })}`;

        let playerStr = `  players: ${this.players.map((player, idx) => {
            if (idx === 0) {
                return '[\n    ' + player.toString() + ',\n';
            } else if (idx === this.players.length - 1) {
                return '   ' + player.toString() + '\n  ]';
            } else {
                return '   ' + player.toString() + ',\n';
            }
        })}`;

        return str + deckStr + playerStr + '\n}';
    }
}

module.exports = {
    PokerGame,
};
