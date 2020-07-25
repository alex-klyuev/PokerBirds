const { beautifyCard, toDollars } = require('./utils');

class Player {
    constructor(id, stack, game) {
        if (id === undefined || stack === undefined || typeof game !== 'object') {
            throw new Error(`Invalid values for id=${id}, stack=${stack}, or game=${game}`);
        }
        this.id = id;
        // All monetary values are in cents
        this.stack = stack;
        this.game = game;
        this.cards = [[], []];
        this.actionState = '';
        this.potCommitment = 0;
        this.totalPC = 0; // Total pot commitment. Resets only when a dealer round refreshes.
        this.inGame = true;
        this.allowRaise = true;
        this.isAllIn = false;
        this.showdownRank = [];
    }

    // the raise function is the only one of the four actions that depends on a numerical input from the user,
    // hence it is the only one that takes an argument
    raise(bet) {
        // since user inputs total bet, the raise amount is the difference between the bet and player's pot commitment
        let raiseAmount = bet - this.potCommitment;

        let newStack = this.stack - raiseAmount;
        if (newStack < 0) {
            throw new Error(`Player ${this.id} cannot bet ${bet}. Stack would go negative.`);
        } else if (newStack === 0) {
            this.isAllIn = true;
        }

        // update stack and increase pot
        this.stack = newStack;
        this.game.pot += raiseAmount;

        this.actionState = 'raise';

        // if the amount bet is greater than the previous bet and the minimum raise, update the minimum raise.
        // this should always occur unless the player raises all-in without having enough to go above the minimum raise
        if (bet > this.game.previousBet + this.game.minRaise) {
            this.game.minRaise = bet - this.game.previousBet;
        } // else {} should have code here to handle edge case 1 (see bottom notes)

        this.potCommitment += raiseAmount;
        this.totalPC += raiseAmount;

        // previous bet is updated. see bottom notes for edge case 2: second scenario assumed
        this.game.previousBet = this.potCommitment;

        // once there's been a raise, no one else can check in that action round.
        this.game.allowCheck = false;

        // if a raise above the min raise has occurred, allow all other players to raise again
        this.game.players.forEach(player => player.allowRaise = true);
    }

    call() {
        this.actionState = 'call';

        // the amount that a call moves from stack to pot is equal to the previous bet minus how much the player has already committed
        // to the pot
        let callAmount = this.game.previousBet - this.potCommitment;

        // if callAmount called bet is larger than stack, toggles an all-in call.
        if (callAmount >= this.stack) {
            callAmount = this.stack;
            this.isAllIn = true;
        }

        // decrease stack, increase pot and increase pot commitment
        this.stack -= callAmount;
        this.game.pot += callAmount;
        this.potCommitment += callAmount;
        this.totalPC += callAmount;
    }

    check() {
        this.actionState = 'check';
    }

    // need code to take player out of the game in a fold.
    fold() {
        this.actionState = 'fold';
        this.inGame = false;
        // set this equal to 0 so it doesn't display on the game output
        this.potCommitment = 0;
    }

    allIn() {
        this.isAllIn = true;

        // might need to handle equals or less differently based on side pots
        // second if is for an all-in that clears the min raise
        // third if is to handle situation where all-in is a raise but doesn't clear the min raise
        if (this.stack + this.potCommitment <= this.game.previousBet) {

            // an all-in less than the previous bet amount is handled like a call
            // implied that the round will end when it's the previous raises turn and no one else has raised
            this.call();

        } else if (this.stack + this.potCommitment >= this.game.previousBet + this.game.minRaise) {

            // an all-in above or equal to the min bet amount is handled like a normal raise
            let bet = this.stack + this.potCommitment;
            this.raise(bet);

        } else {

            // in the case of an all-in raise where the bet does not exceed the min bet amount,
            // previous raiser is not allowed to raise unless someone else raises
            let bet = this.stack + this.potCommitment;

            // save and reset the min raise amount so it's not changed by the raise method
            let minRaise = this.game.minRaise;
            this.raise(bet);
            this.game.minRaise = minRaise;

            // find the previous raiser and do not allow them to raise
            let copy = this.game.players.slice();
            let firstHalf = copy.slice(0, this.game.turn);
            let secondHalf = copy.slice(this.game.turn + 1);
            let reversedplayers = [...firstHalf.reverse(), ...secondHalf.reverse()];
            for (let i = 0; i < reversedplayers.length; i++) {
                let player = reversedplayers[i]
                if (player.actionState === 'raise' && !player.isAllIn) {
                    player.allowRaise = false;
                }
            }
        }
    }

    toString() {
        let str = `Player { ` +
            `ID: ${this.id}, ` +
            `stack: ${toDollars(this.stack)}, ` +
            `actionState: ${this.actionState}, `+
            `potCommitment: ${toDollars(this.potCommitment)}, `+
            `totalPC: ${toDollars(this.totalPC)}, `+
            `inGame: ${this.inGame}, `+
            `showdownRank: ${this.showdownRank}, `+
            `allowRaise: ${this.allowRaise}, `+
            `isAllIn: ${this.isAllIn}, `;

        let cardsStr = `[ ${beautifyCard(this.cards[0])}, ${beautifyCard(this.cards[1])} ]`;
        return str + `cards: ${cardsStr} }`
    }
}

module.exports = { 
    Player,
};
