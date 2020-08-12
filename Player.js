const { Pot } = require('./Pot');
const { beautifyCard, toDollars } = require('./utils');

class Player {
    constructor(id, stack, game) {
        if (id === undefined || stack === undefined || typeof game !== 'object') {
            throw new Error(`Invalid value(s): id=${id}, stack=${stack}, game=${game}`);
        }
        this.id = id;
        // All monetary values are in cents
        this.stack = stack;
        this.game = game;
        this.cards = [null, null];
        this.actionState = '';
        this.potCommitment = 0;
        this.inGame = true;
        this.allowRaise = true;
        this.isAllIn = false;
        this.showdownRank = null;
    }

    // raise method is only one of the four actions that depends on a numerical input from the user
    raise(bet) {
        // since user inputs total bet, the raise amount is the difference between the bet and player's pot commitment
        let raiseAmount = bet - this.potCommitment;

        let newStack = this.stack - raiseAmount;
        if (newStack < 0) {
            throw new Error(`Player ${this.id} cannot bet ${bet}. Stack would go negative.`);
        } else if (newStack === 0) {
            this.isAllIn = true;
        }
        // update stack
        this.stack = newStack;

        let openPots = this.game.pots.filter((pot) => pot.open);
        // if there are no open pots, create a new one and add the relevant info
        if (openPots.length === 0) {
            let newPot = new Pot(this.game);
            this.game.pots.push(newPot);
            newPot.currARAmount = raiseAmount;
            newPot.playerCommitment = raiseAmount;
            newPot.history.set(this.id, raiseAmount);
            newPot.potentialWinners.add(this.id);

        // If there are open pots, iterate through them and place portions of raiseAmount to fulfill the needed amount
        // to pay for each pot. For the last pot, raise the playerCommitment amount required for future callers to pay for it.
        } else {
            let transferStack = raiseAmount;
            for (let i = 0; i < openPots.length; i++) {
                let pot = openPots[i];

                // last pot is treated differently, as here is where raiser will either:
                //  - create a new sidePot if last pot has an allIn player, OR
                //  - raise the playerCommitment amount needed to pay to be able to call and get it in that pot
                if (i === openPots.length - 1) {
                    if (pot.hasAllInPlayerThatsNot(this.id)) {
                        // Place bet (if needed) in what's currently the last pot. Then, create the side pot.
                        if (!pot.hasPlayerInPotentialWinners(this.id)) {
                            let amountToFulfillPot = pot.playerCommitment - pot.getPlayerHistory(this.id);
                            pot.currARAmount += amountToFulfillPot;
                            transferStack -= amountToFulfillPot;

                            pot.history.set(this.id, pot.getPlayerHistory(this.id) + amountToFulfillPot);
                            if (pot.playerCommitment !== pot.getPlayerHistory(this.id)) { // TODO: Remove once confirmed works.
                                throw new Error(`Inconsistency: pot.playerCommitment ${pot.playerCommitment} should equal`
                                    + ` pot.getPlayerHistory(this.id) ${pot.getPlayerHistory(this.id)}.`);
                            }

                            pot.potentialWinners.add(this.id);
                        }
                        // create new side pot
                        let sidePot = new Pot(this.game);
                        sidePot.currARAmount = transferStack;
                        sidePot.playerCommitment = transferStack;
                        sidePot.history.set(this.id, transferStack);
                        sidePot.potentialWinners.add(this.id);
                        this.game.pots.push(sidePot);

                    // pot.playerCommitment should be raised in the following else {} block, since the last pot has no
                    // all-in player
                    } else {
                        // If the statement below is true, the player will not be raising the playerCommitment amount,
                        // which goes against the conditions that led to this else {} block being executed.
                        // TODO: The below is a sanity check. Remove once confirmed and place in tests.
                        if (pot.getPlayerHistory(this.id) + transferStack <= pot.playerCommitment) {
                            throw new Error(`Inconsistency: pot.getPlayerHistory(this.id) ${pot.getPlayerHistory(this.id)} +` +
                                ` transferStack ${transferStack} <= pot.playerCommitment ${pot.playerCommitment}`);
                        }

                        // increase pot amount, playerCommitment, etc.
                        pot.currARAmount += transferStack;
                        pot.playerCommitment = pot.getPlayerHistory(this.id) + transferStack;
                        pot.history.set(this.id, pot.getPlayerHistory(this.id) + transferStack);

                        // TODO: The below is a sanity check. Remove once confirmed and place in tests.
                        if (pot.playerCommitment !== pot.getPlayerHistory(this.id)) {
                            throw new Error(`Inconsistency: pot.playerCommitment ${pot.playerCommitment} should equal`
                                + ` pot.getPlayerHistory(this.id) ${pot.getPlayerHistory(this.id)}.`);
                        }

                        pot.potentialWinners = new Set();
                        pot.potentialWinners.add(this.id);
                    }

                    break;
                // Since we're not in the last pot and this is a raise, we should be able to transfer parts out of the
                // transferStack into these if the currentPlayer hasn't already fulfilled the current pot.
                // Also, these pots should have players that are all-in, if not they wouldn't exist in the first place.
                } else {
                    // TODO: The below is a sanity check. Remove once confirmed and place in tests.
                    if (!pot.hasAllInPlayerThatsNot(this.id)) {
                        throw new Error(`Inconsistency: Pot should have all-in player.`);
                    }

                    if (!pot.hasPlayerInPotentialWinners(this.id)) {
                        let amountToFulfillPot = transferStack - pot.getPlayerHistory(this.id);
                        pot.currARAmount += amountToFulfillPot;
                        transferStack -= amountToFulfillPot;
                        pot.history.set(this.id, pot.getPlayerHistory(this.id) + amountToFulfillPot);
                        pot.potentialWinners.add(this.id);
                    }
                }
            }
        }

        this.actionState = 'raise';

        // if the amount bet is greater than the previous bet and the minimum raise, update the minimum raise.
        // this should always occur unless the player raises all-in without having enough to go above the minimum raise
        if (bet >= this.game.previousBet + this.game.minRaise) {
            this.game.minRaise = bet - this.game.previousBet;
            // if a raise above the min raise has occurred, allow all other players to raise again
            this.game.players.forEach(player => player.allowRaise = true);
        } else {
            // Edge case 1: In this else {}, do nothing.
            //   However, I'm leaving this here to emphasize that within here occurs the edge case that the player
            //   raised all-in but their raise wasn't enough to cover the minRaise. Thus, the previous raiser (if any)
            //   can no longer re-raise unless someone else raises above minRaise. Moreover, we don't need to set that
            //   player's canRaise field to false because to get to this point, we should have validated that the
            //   player wasn't able to "raise" perse, they should have gotten here via the allIn() method.
        }

        this.potCommitment += raiseAmount;

        // Edge case 2:
        //   P1 raises 500. P2 raises all-in for 700. The game.minRaise is is still 500. P1 is not allowed to re-raise
        //   unless another player re-raises (that's what the above comment references). But now, if P3 wants to
        //   re-raise, is the minimum 1000 or 1200? Assuming 1200 for now.
        // previous bet is updated
        this.game.previousBet = this.potCommitment;

        // once there's been a raise, no one else can check in that action round.
        this.game.allowCheck = false;
    }

    call() {
        this.actionState = 'call';

        // amount a call moves from stack to pot === previous bet – how much the player has already committed to the pot
        let callAmount = this.game.previousBet - this.potCommitment;

        // if callAmount called bet is larger than stack, toggles an all-in call.
        if (callAmount >= this.stack) {
            callAmount = this.stack;
            this.isAllIn = true;
        }

        this.stack -= callAmount; // decrease stack by callAmount

         // TODO: Remove and put in test once confirmed. This is a sanity check.
        if (this.game.pots.reduce((acc, pot) => pot.open ? acc + 1 : acc, 0) === 0) {
            throw new Error(`There should be at least 1 open pot when calling. There were 0 open pots found.`);
        }

        // renaming to have clearer variable name
        let transferAmount = callAmount;
        let { pots } = this.game;
        for (let i = 0; i < pots.length; i++) {
            let pot = pots[i];
            if (!pot.open || pot.hasPlayerInPotentialWinners(this.id)) {
                continue;
            }

            let amountToFulfillPot = pot.playerCommitment - pot.getPlayerHistory(this.id);
            if (amountToFulfillPot > transferAmount) {
                // divide current pot in 2:
                //   Pot 1 is called by the current player. It's a separate pot.
                //   Pot 2 is the side pot where the excess amount that the current player can't pay goes to.
                let newPlayerCommitment = transferAmount +  pot.getPlayerHistory(this.id);
                let [newPot, sidePot] = Pot.separate(pot, newPlayerCommitment);

                // TODO: Remove when confirmed and add to tests
                if (newPlayerCommitment !== newPot.playerCommitment){
                    throw new Error(`newPlayerCommitment ${newPlayerCommitment} !== newPot.playerCommitment ` +
                        `${newPot.playerCommitment}.\n  newPot=${newPot.toString()}\n  sidePot=${sidePot.toString()}`);
                }
                newPot.potentialWinners.add(this.id);

                if (i === 0) {
                    pots[0] = newPot;
                    pots.push(sidePot);
                } else {
                    pots.splice(i, 0, newPot);
                    pots[i + 1] = sidePot;
                }

                break;

            } else {
                pot.currARAmount += amountToFulfillPot;
                transferAmount -= amountToFulfillPot;

                pot.history.set(this.id, pot.getPlayerHistory(this.id) + amountToFulfillPot);

                // TODO: Remove once confirmed works and add to tests.
                if (pot.playerCommitment !== pot.getPlayerHistory(this.id)) {
                    throw new Error(`Inconsistency: pot.playerCommitment=${pot.playerCommitment} should equal `
                        + `pot.getPlayerHistory(this.id)=${pot.getPlayerHistory(this.id)}.`);
                }

                pot.potentialWinners.add(this.id);
            }

        }

        this.potCommitment += callAmount;
    }

    check() {
        this.actionState = 'check';
    }

    // Need code to take player out of the game in a fold.
    // ^ Actually this is already resolved. When player folds, player.inGame === false. If they actually leave game,
    //   we can just start a new PokerGame without that player, and copy everything into it, or perhaps even splice out
    //   the player in game.players.
    // TODO: Should we delete player's cards here?
    fold() {
        this.actionState = 'fold';
        this.inGame = false;
        // set this equal to 0 so it doesn't display on the game output
        this.potCommitment = 0;
        this.game.pots.forEach((pot) => pot.potentialWinners.delete(this.id));
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
            // TODO: Confirm that the only time this case is allowed is if a player goes allIn. That is, the player
            // "raising" but their raise being < minRaise. We should only allow these edge case raises by allIn calls.

            // in the case of an all-in raise where the bet does not exceed the min bet amount,
            // previous raiser is not allowed to raise unless someone else raises
            let bet = this.stack + this.potCommitment;

            // save and reset the min raise amount so it's not changed by the raise method
            let minRaise = this.game.minRaise;
            this.raise(bet);
            this.game.minRaise = minRaise;

            // find the previous raiser and do not allow them to raise
            let firstHalf = this.game.players.slice(0, this.game.turn);
            let secondHalf = this.game.players.slice(this.game.turn + 1);
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
        return `Player { ` +
            `id: ${this.id}, ` +
            `cards: [ ${beautifyCard(this.cards[0])}, ${beautifyCard(this.cards[1])} ], ` +
            `actionState: ${this.actionState}, `+
            `potCommitment: ${toDollars(this.potCommitment)}, `+
            `stack: ${toDollars(this.stack)}, ` +
            `inGame: ${this.inGame}, `+
            `allowRaise: ${this.allowRaise}, `+
            `isAllIn: ${this.isAllIn}, ` +
            `showdownRank: ${this.showdownRank} }`;
    }
}

module.exports = { 
    Player,
};
