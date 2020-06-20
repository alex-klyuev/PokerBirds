/*GENERAL NOTES---------------------------------------------------------------------------------------------
This game is made so that you can play with cents, which is a feature I want available in the end product.
For that reason, player inputs are converted to cents by multiplying everything by 100, and then divided by
100 before logging back to the console. Open to changes on this front.                                    */


//INITIALIZATION CODE---------------------------------------------------------------------------------------

console.log('\nWelcome to PokerBirds!');

//set up Input Listener
process.stdin.resume();
process.stdin.addListener('data', handleCommandLineInput);

// query user for number of players
console.log('\nPlease enter the number of players, between 2 to 8:');




//GAME OBJECTS----------------------------------------------------------------------------------------------

class Player {
    constructor(ID) {
        this.ID = ID;
        this.stack = 0;
        this.cards = [[], []];
        this.actionState = '';
        this.potCommitment = 0;
        this.inGame = true;
    }

    //the raise function is the only one of the four actions that depends on a numerical input from the user,
    //hence it is the only one that takes an argument
    raise(bet) {
        this.actionState = 'raise';

        //since user inputs total bet, the raise amount is the difference between the bet and player's pot commitment
        let amount = bet - this.potCommitment;

        //decrease stack and increase pot
        this.stack = this.stack - amount;
        pot = pot + amount;

        //if the amount bet is greater than the previous bet and the minimum raise, update the minimum raise.
        //this should always occur unless the player raises all-in without having enough to go above the minimum raise
        if (bet > previousBet + minRaise) {
            minRaise = bet - previousBet;
        } //else {} should have code here to handle edge case 1 (see bottom notes)

        this.potCommitment = this.potCommitment + amount;

        //previous bet is updated. see bottom notes for edge case 2: second scenario assumed
        previousBet = this.potCommitment;

        //once there's been a raise, no one else can check in that action round.
        checkState = false;
    }

    call() {
        this.actionState = 'call';

        //the amount that a call moves from stack to pot is equal to the previous bet minus how much the player has already committed
        //to the pot
        let amount = previousBet - this.potCommitment;

        //if amount called bet is larger than stack, toggles an all-in call.
        if (amount > this.stack) {
            amount = this.stack;
        }

        //decrease stack and increase pot
        this.stack = this.stack - amount;
        pot = pot + amount;
        this.potCommitment = this.potCommitment + amount;
    }

    check() {
        this.actionState = 'check';
    }

    //need code to take player out of the game in a fold.
    fold() {
        this.actionState = 'fold';
        this.inGame = false;
        //set this equal to 0 so it doesn't display on the game output
        this.potCommitment = 0;
    }
}

//global variables that remain the same for the entire game
var playerObjectArray;
var buyIn;
var smallBlind;
var bigBlind;

//the "shuffle deck" function simply creates a new full deck. The deck array is global

const buildDeck = () => {
    deckArray = [];
    for (let i = 0; i < 52; i++) {
        deckArray.push(['', '']);
    }

    for (let i = 0; i < 13; i++) {
        deckArray[i][1] = '♠';
        deckArray[i][0] = i + 2;
    }
    for (let i = 13; i < 26; i++) {
        deckArray[i][1] = '♣';
        deckArray[i][0] = i - 11;
    }
    for (let i = 26; i < 39; i++) {
        deckArray[i][1] = '♦';
        deckArray[i][0] = i - 24;
    }
    for (let i = 39; i < 52; i++) {
        deckArray[i][1] = '♥';
        deckArray[i][0] = i - 37;
    }
}




//GAME FUNCTIONS--------------------------------------------------------------------------------------------


//this function assigns cards from the deck to players. Remaining deck is returned and player objects are
//updated accordingly. Only needs to run once at the beginning of each round.
const dealCards = () => {
    for (let i = 0; i < playerObjectArray.length; i++) {
        let x = Math.floor(Math.random() * deckArray.length);
        playerObjectArray[i].cards[0] = deckArray[x];
        deckArray.splice(x, 1);
        let y = Math.floor(Math.random() * deckArray.length);
        playerObjectArray[i].cards[1] = deckArray[y];
        deckArray.splice(y, 1);
    }
}


//increments turn so that it can loop around the table
const incrementTurn = () => {
    turn++;
    turn %= playerObjectArray.length;
}


const postBlinds = () => {

    //post small blind
    minRaise = 0;
    previousBet = 0;
    playerObjectArray[turn].raise(smallBlind);
    playerObjectArray[turn].actionState = 'SB';
    incrementTurn();

    //post big blind; vars are set to 0 to allow a raise (so that later bb can check at the end of pre-flop)
    minRaise = 0;
    previousBet = 0;
    playerObjectArray[turn].raise(bigBlind);
    playerObjectArray[turn].actionState = 'BB';
    incrementTurn();
    minRaise = bigBlind;
    previousBet = bigBlind;
    checkState = false;
}


//takes a card out of the deck and adds it to the board next opening.
//will need to be called 3 times for the flop, once for turn and once for river.
const addToBoard = () => {
    let x = Math.floor(Math.random() * deckArray.length);
    for (let i = 0; i < 5; i++) {
        if (board[i] === '') {
            board[i] = deckArray[x];
            deckArray.splice(x, 1);
            return;
        }
    }
}


//takes in the card array of 2, and returns 1 string
const beautifyCard = (card) => {
    card[0] = card[0].toString();
    if (card[0] === '14') {
        card[0] = 'A'
    }
    if (card[0] === '11') {
        card[0] = 'J'
    }
    if (card[0] === '12') {
        card[0] = 'Q'
    }
    if (card[0] === '13') {
        card[0] = 'K'
    }
    return card[0] + card[1];
}


//this function logs the current game condition so that everyone can see it.
//this includes the player id's, stacks, and cards to indicate if they're in the game or not.
//also indicates the round status: whether the player has checked, raised, or called, and how much they have
//committed to the pot.
//it will also demonstrate the board and the pot.
const outputGameStatus = () => {
    let outputLine1 = '\n';
    let outputLine2 = '';
    let outputLine3 = '';
    let outputLine4 = '';
    let outputLine5 = '';

    //this for loop builds the 5 lines required to show what each player has, their pot commitment, and their previous action.
    for (let i = 0; i < playerObjectArray.length; i++) {

        //P1, P2, etc.
        outputLine1 = outputLine1 + 'P' + (i + 1).toString() + '      ';

        //since stack amount may vary, need to equalize the stack line to a total of 8 chars per player.
        let x = convertToDollars(playerObjectArray[i].stack).toString();
        let y = '';
        for (let j = 0; j < (7 - x.length); j++) {
            y = y + ' ';
        }
        outputLine2 = outputLine2 + '$' + x + y;

        //show cards only for players that are still in the game
        if (playerObjectArray[i].inGame === true) {
            outputLine3 = outputLine3 + '🂠🂠      ';
        } else {
            outputLine3 = outputLine3 + '        ';
        }

        //since action word length will vary, need to equalize line to 8 chars per player
        x = playerObjectArray[i].actionState;
        y = '';
        for (let j = 0; j < (8 - x.length); j++) {
            y = y + ' ';
        }
        outputLine4 = outputLine4 + x + y;

        //since pot commitment will vary, need to equalize line to 8 chars per player
        if (playerObjectArray[i].potCommitment === 0) {
            outputLine5 = outputLine5 + '        ';
        } else {
            x = convertToDollars(playerObjectArray[i].potCommitment).toString();
            y = '';
            for (let j = 0; j < (7 - x.length); j++) {
                y = y + ' ';
            }
            outputLine5 = outputLine5 + '$' + x + y;
        }
    }

    //sixth line shows the board & seventh line shows the pot
    let outputLine6 = '\nBoard: ';
    if (board[0] != '') {
        outputLine6 = outputLine6 + '| ';
    }
    for (let i = 0; i < 5; i++) {
        if (board[i] != '') {
            outputLine6 = outputLine6 + beautifyCard(board[i]) + ' | ';
        }
    }

    console.log(outputLine1);
    console.log(outputLine2);
    console.log(outputLine3);
    console.log(outputLine4);
    console.log(outputLine5);
    console.log(outputLine6);
    console.log('Pot: $' + convertToDollars(pot).toString());
}


//output that comes under the board
const outputPlayerInquiry = () => {
    console.log('\nPlayer ' + playerObjectArray[turn].ID + ', it\'s your turn.');
    console.log('Your cards: | ' + beautifyCard(playerObjectArray[turn].cards[0]) + ' | '
        + beautifyCard(playerObjectArray[turn].cards[1]) + ' |');
    console.log(`Min bet: $${convertToDollars(previousBet + minRaise)} \n`);
}


//just to make it easier to keep track where I'm doing this
const convertToDollars = (value) => {
    value = value / 100;
    return value;
}
const convertToCents = (value) => {
    value = value * 100;
    return value;
}


//function to toggle the various methods corresponding to player actions 
const handlePlayerAction = (action) => {
    if (action[0] === 'call') {
        playerObjectArray[turn].call();
    }
    if (action[0] === 'raise') {
        playerObjectArray[turn].raise(action[1]);
    }
    if (action[0] === 'fold') {
        playerObjectArray[turn].fold();
    }
    if (action[0] === 'check') {
        playerObjectArray[turn].check();
    }
}


//Action round ending conditions fall into two categories: 
// 1. "No-raise": where there has been no raise and everyone checks or folds, or in the case of the pre-flop, 
//calls, checks, or folds.
// 2. "Raise": where there is one remaining raiser and everyone else behind calls or folds.

const checkActionRoundEndingCondition = () => {
    let actionCounter1 = 0;
    let actionCounter2 = 0;
    for (let i = 0; i < playerObjectArray.length; i++) {

        //handles both pre-flop and post-flop "no raise" situations 
        if (playerObjectArray[i].actionState === 'call' || playerObjectArray[i].actionState === 'fold'
            || playerObjectArray[i].actionState === 'check' || playerObjectArray[i].actionState === '') {
            actionCounter1++;
        }

        //handles "raise" situations
        if (playerObjectArray[i].actionState === 'call' || playerObjectArray[i].actionState === 'fold'
            || playerObjectArray[i].actionState === '') {
            actionCounter2++;
        }
    }

    //can be combined later
    //no-raise scenario 
    if (actionCounter1 === playerObjectArray.length) {
        console.log('action round ended via no-raise scenario');
        return true;
    }

    //raise scenario
    if (actionCounter2 === playerObjectArray.length - 1 && playerObjectArray[turn].actionState === 'raise') {
        console.log('action round ended via raise scenario');
        return true;
    }


}

//this function will end the dealer round when everyone except one person has folded. That person will win the pot.
//This is one of two ways a dealer round can end - the other is with a showdown that has its own function.
const checkDealerRoundEndingCondition = () => {
    let dealerCounter = 0;
    let winnerIndex;
    for (let i = 0; i < playerObjectArray.length; i++) {
        if (playerObjectArray[i].actionState === 'fold' || playerObjectArray[i].actionState === '') {
            dealerCounter++;
        } else {
            winnerIndex = i;
        }
    }
    if (dealerCounter === playerObjectArray.length - 1) {

        //move pot to winner's stack
        playerObjectArray[winnerIndex].stack = playerObjectArray[winnerIndex].stack + pot;
        console.log(`\nPlayer ${playerObjectArray[winnerIndex].ID} wins $${convertToDollars(pot)}`);
        pot = 0;
        return true;
    }
}


//this function restarts the following action round
const refreshActionRound = () => {

    //clear pot commitment and action states; cards remain the same; reset minraise
    for (let i = 0; i < playerObjectArray.length; i++) {
        playerObjectArray[i].potCommitment = 0;
        playerObjectArray[i].actionState = '';
    }
    previousBet = 0;
    minRaise = bigBlind;

    //action in remaining three rounds begins with the small blind
    turn = dealer;
    incrementTurn();
    findNextPlayer();

    //hacky way of setting players to still be in the action round so that the ending condition
    //functions don't immediately read the turn as over at the beginning of the round (could probably
    //be improved to be more clear). Still an empty string so that nothing is ouptut to the board
    for (let i = 0; i < playerObjectArray.length; i++) {
        if (playerObjectArray[i].inGame === true) {
            playerObjectArray[i].actionState = ' ';
        }
    }

    //allow checking at beginning of round
    checkState = true;

    outputGameStatus();
    outputPlayerInquiry();
}


//this function restarts the following dealer round
const refreshDealerRound = () => {

    //refresh all these variables. 
    for (let i = 0; i < playerObjectArray.length; i++) {
        playerObjectArray[i].potCommitment = 0;
        playerObjectArray[i].actionState = '';
        playerObjectArray[i].cards = [[], []];
        playerObjectArray[i].inGame = true;

        //If a player lost their money, they stay out. Can clear them out completely later.
        //Doesn't really matter though because browser version will have option to buy back in, leave, etc.

        //DOUBLE CHECK THIS when showdown and side-pot parts are developed
        if (playerObjectArray[i].stack === 0) {
            playerObjectArray[i].inGame = false;
        }
    }

    //increment dealer
    dealer++;
    dealer %= playerObjectArray.length;

    //clear the board, build a new full deck, and deal cards to the players
    board = ['', '', '', '', ''];
    buildDeck();
    dealCards();

    //set turn to small blind, next after dealer
    turn = dealer;
    incrementTurn();

    //post blinds
    postBlinds();

    //declare the dealer, output the first game board, and announce the first turn
    console.log('\nPlayer ' + playerObjectArray[dealer].ID + ' is the dealer.');
    outputGameStatus();
    outputPlayerInquiry();

}

//this function finds the next player that's still in the game and increments the turn to them
const findNextPlayer = () => {

    //iterates starting from the current turn until it finds the next player that hasn't folded,
    //then breaks the loop
    for (let i = 0; i < playerObjectArray.length; i++) {
        if (playerObjectArray[turn].inGame === false) {
            incrementTurn();
        } else {
            break;
        }
    }
}







//AUXILIARY COMMAND LINE FUNCTIONS: VALIDATE PLAYER INPUT AND THEN RETURN OBJECTS THAT ARE USED IN THE CLF--

const validateAndReturnPlayers = (input) => {

    //validation section
    if (input.length > 1 || input === '') {
        return false;
    }
    input = parseInt(input);
    if (input < 2 || input > 8) {
        return false;
    }

    //create player object array
    playerObjectArray = [];
    for (let i = 0; i < input; i++) {
        playerObjectArray.push([]);
    }
    for (let i = 0; i < input; i++) {
        playerObjectArray[i] = new Player(i + 1);
    }
    return playerObjectArray;

}

const validateAndReturnBuyIn = (input) => {
    input = parseInt(input);
    if (isNaN(input) || input < 1 || input > 999) {
        return false;
    }
    return convertToCents(input);
}

const validateAndReturnBlind = (input) => {
    input = parseFloat(input);
    input = convertToCents(input);
    if (isNaN(input) || input < 1 || input > buyIn / 20) {
        return false;
    }
    return input;
}

//this function will validate player action. If a call, check, or fold, the function returns the respective string.
//in case of a raise, function returns the raise amount in cents.
const validateAndReturnPlayerAction = (input) => {
    let input1 = input.slice(0, 4);
    let input2 = input.slice(4);

    //some imperfect inputs are allowed in this game for the sake of simplicity of the code.
    //it's designed so that player intent is never misunderstood, however
    //this else if statement both validates the input and returns call, check, or fold if it's one of those.
    //if it's a raise, it goes on to the next section to validate the amount
    if (input1 === 'call') {

        //validate that there is a raise on the board to be called. Second part is to allow the SB to call
        //when it is not equal to the big blind


        //FIX BUG - CAN'T CALL WHEN SB = BB


        let raiseCounter = 0;
        for (let i = 0; i < playerObjectArray.length; i++) {

            //this allows the small blind to call big blind as well
            if (playerObjectArray[i].actionState === 'raise' || (playerObjectArray[i].actionState === 'SB')) {
                raiseCounter++;
            }
        }

        //exception for situation where small blind is equal to big blind; SB cannot call there
        if (raiseCounter === 0 || playerObjectArray[turn].actionState === 'SB' && smallBlind === bigBlind) {
            console.log('You cannot call here.');
            return false;
        }
        return ['call', ''];

    } else if (input1 === 'fold') {
        return ['fold', ''];
    } else if (input1 === 'chec') {

        //validate that player is allowed to check
        if (checkState === false) {
            console.log('You cannot check here.');
            return false;
        }
        return ['check', '']
    }
    else if (input1 != 'bet ') {
        return false;
    }

    //second input: verify that the raise is an increment of the small blind, equal or above the minimum raise,
    //and less than or equal to the player's stack. exception is made if player bets stack; then bet gets through
    //regardless of the min raise.
    input2 = convertToCents(parseFloat(input2));
    if (input2 === playerObjectArray[turn].stack) {
        return ['raise', input2];
    }
    if (input2 % smallBlind != 0 || input2 < previousBet + minRaise || input2 > playerObjectArray[turn].stack
        + playerObjectArray[turn].potCommitment) {
        console.log('You can\'t raise that amount.');
        return false;
    }
    return ['raise', input2];
}







//COMMAND LINE FUNCTION (CLF)-------------------------------------------------------------------------------

//global variables --- vars such as dealer & turn that iterate through arrays are based on array metrics (0-7)
var CLFstate = 0;
var dealer;
var turn;
var pot = 0;
var actionRoundState = 0;
var board = ['', '', '', '', ''];
var deckArray;
var minRaise;
var previousBet;
var checkState;
//checkState var indicates whether previous action was a check (checkState = true), allowing for following player to check as well.
//starts this way automatically at beginning of flop, turn, and river. A raise by any player will 
//toggle the state to false for the rest of the round. Is also toggled for the big blind pre-flop and small blind
//if SB = BB.

function handleCommandLineInput(input) {
    input = input.toString().substring(0, input.length - 1);
    //NO CODE FROM HERE SHOULD BE OUTSIDE OF A CLFstate IF STATEMENT 


    //PRE-GAME CODE: runs once before the game begins-------------------------------------------------------

    //validate number of players and create objects for each player
    if (CLFstate === 0) {
        playerObjectArray = validateAndReturnPlayers(input);
        if (playerObjectArray === false) {
            console.log('Please enter a valid input.');
            return;
        }

        //console logs for next block needs to occur within previous if statement
        CLFstate++;
        console.log('\nWelcome to the game, players 1 through ' + playerObjectArray.length + '. Here are the game settings:');
        console.log('Buy-ins must be in dollar increments. Blinds and bets can be in increments of cents,');
        console.log('but be sure to input them as decimals. The small blind will be the smallest chip size,');
        console.log('so the big blind and all bets must be multiples of that. The minimum buy-in is 20 times the big blind,');
        console.log('and the maximum is $999. Now, without further ado - what will your buy-in be?');
        return;
    }

    //validate buy-in, small blind, and big blind, and set global variables
    if (CLFstate === 1) {
        buyIn = validateAndReturnBuyIn(input);
        if (buyIn === false) {
            console.log('Please enter a valid input.');
            return;
        }

        //set each player's stack to the buy-in
        for (let i = 0; i < playerObjectArray.length; i++) {
            playerObjectArray[i].stack = buyIn;
            playerObjectArray[i].cards = [[], []];
        }

        //iterate state and ask next question
        CLFstate++;
        console.log('What will the small blind be?');
        return;
    }

    if (CLFstate === 2) {
        smallBlind = validateAndReturnBlind(input);
        if (smallBlind === false) {
            console.log('Please enter a valid input.');
            return;
        }
        CLFstate++;
        console.log('What will the big blind be?');
        return;
    }

    if (CLFstate === 3) {
        bigBlind = validateAndReturnBlind(input);
        if (bigBlind === false || smallBlind > bigBlind || bigBlind % smallBlind != 0) {
            console.log('Please enter a valid input.');
            return;
        }

        console.log('\nGreat! Let\'s begin the game. Here are the game rules:');
        console.log('To raise, enter \"bet\" followed by a space and the total amount you\'d like to bet (no dollar signs).');
        console.log('In the case of a re-raise, make sure you input the total amount you are raising to, not just the raise amount.');
        console.log('To call, check, or fold, simply enter \"call\", \"check\", or \"fold\". The first dealer will be picked randomly.');

        //pick random player to begin as the first dealer
        dealer = Math.floor(Math.random() * playerObjectArray.length);
        CLFstate++;
    }



    //"DEALER ROUND BLOCK" - code block to iterate within each dealer round---------------------------------------
    //A "dealer round" is defined as the overall round from pre-flop to showdown, since dealer changes from round to round.
    //The four rounds from pre-flop to showdown will be called "action rounds".

    //Block 1 - only needs to run once at the beginning of each dealer round: everything until action after the big blind.
    if (CLFstate === 4) {

        //build a new full deck and deal cards to the players
        buildDeck();
        dealCards();

        //set turn to small blind, next after dealer
        turn = dealer;
        incrementTurn();

        //post blinds
        postBlinds();

        //declare the dealer, output the first game board, and announce the first turn
        console.log('\nPlayer ' + playerObjectArray[dealer].ID + ' is the dealer.');
        outputGameStatus();
        outputPlayerInquiry();

        //edge case scenario where there are only 2 players and sb = bb, first player to act is sb
        //and this allows them to check
        if (playerObjectArray[turn].actionState === 'SB' && smallBlind === bigBlind) {
            checkState = true;
        }

        CLFstate++;
        return;
    }

    //Block 2 handles the 4 action rounds - this code will cycle within a dealer round.

    //Handles the pre-flop action round (action round 0)
    if (actionRoundState === 0) {

        let action = validateAndReturnPlayerAction(input);
        if (action === false) {
            console.log('Please enter a valid input.');
            return;
        }

        //function to call the method corresponding to player action
        handlePlayerAction(action);

        incrementTurn();

        //function to find the next player that is still in the game
        findNextPlayer();

        //once turn is incremented, following code is what needs to be executed for the next player before
        //next user input

        //pre-flop, the big blind (and the small blind if it's equal to big blind) 
        //have the option to check if all other players called or folded.

        let preflopCounter = 0;

        //toggles the check state for the small blind if it's equal to the big blind
        if (playerObjectArray[turn].actionState === 'SB' && smallBlind === bigBlind) {

            //count active raises on board; if the SB & BB are the only ones, they can check
            for (let i = 0; i < playerObjectArray.length; i++) {
                if (playerObjectArray[i].actionState != 'raise') {
                    preflopCounter++;
                }
            }

            console.log(preflopCounter);

            if (preflopCounter === playerObjectArray.length) {
                checkState = true;
            }
        }

        //toggles the check state for the big blind - unless the BB is equal to the SB, in which case
        //it has already been toggled.

        //edge case: big blind re-raised and all other players called. Hmmm
        if (playerObjectArray[turn].actionState === 'BB' && smallBlind != bigBlind) {

            //count active raises on board; if the BB's is the only one, they can check
            for (let i = 0; i < playerObjectArray.length; i++) {
                if (playerObjectArray[i].actionState != 'raise') {
                    preflopCounter++;
                }
            }
            if (preflopCounter === playerObjectArray.length) {
                checkState = true;
            }
        }

        // check if dealer round is done. comes before action round because of edge case where one player checks
        // and all others fold.
        if (checkDealerRoundEndingCondition()) {

            //will set everything through the blinds up for next round and output to the board
            refreshDealerRound();

            actionRoundState = 0;
            return;
        }

        //check if action round is done
        if (checkActionRoundEndingCondition()) {

            //flop
            addToBoard();
            addToBoard();
            addToBoard();

            //remaining code that is the same between each action round
            refreshActionRound();

            actionRoundState++;
            return;
        }

        outputGameStatus();
        outputPlayerInquiry();
        return;

    }

    //Handles the flop action round (action round 1)
    if (actionRoundState === 1) {

        let action = validateAndReturnPlayerAction(input);
        if (action === false) {
            console.log('Please enter a valid input.');
            return;
        }

        handlePlayerAction(action);
        incrementTurn();

        for (let i = 0; i < playerObjectArray.length; i++) {
            if (playerObjectArray[turn].inGame === false) {
                incrementTurn();
            } else {
                break;
            }
        }

        if (checkDealerRoundEndingCondition()) {
            refreshDealerRound();
            actionRoundState = 0;
            return;
        }

        if (checkActionRoundEndingCondition()) {
            addToBoard(); //turn
            refreshActionRound();
            actionRoundState++;
            return;
        }

        outputGameStatus();
        outputPlayerInquiry();
        return;
    }

    //Handles the turn action round (action round 2)
    if (actionRoundState === 2) {

        let action = validateAndReturnPlayerAction(input);
        if (action === false) {
            console.log('Please enter a valid input.');
            return;
        }

        handlePlayerAction(action);
        incrementTurn();

        for (let i = 0; i < playerObjectArray.length; i++) {
            if (playerObjectArray[turn].inGame === false) {
                incrementTurn();
            } else {
                break;
            }
        }

        if (checkDealerRoundEndingCondition()) {
            refreshDealerRound();
            actionRoundState = 0;
            return;
        }

        if (checkActionRoundEndingCondition()) {
            addToBoard(); //river
            refreshActionRound();
            actionRoundState++;
            return;
        }

        outputGameStatus();
        outputPlayerInquiry();
        return;
    }

    //Handles the river action round (action round 3)
    if (actionRoundState === 3) {

        let action = validateAndReturnPlayerAction(input);
        if (action === false) {
            console.log('Please enter a valid input.');
            return;
        }

        handlePlayerAction(action);
        outputGameStatus();
        incrementTurn();

        for (let i = 0; i < playerObjectArray.length; i++) {
            if (playerObjectArray[turn].inGame === false) {
                incrementTurn();
            } else {
                break;
            }
        }

        if (checkDealerRoundEndingCondition()) {
            refreshDealerRound();
            actionRoundState = 0;
            return;
        }

        //this part will be replaced with showdown
        if (checkActionRoundEndingCondition()) {
            console.log('Ladies and gentlemen, we have a showdown!');
            showdown();
            return;
        }

        outputGameStatus();
        outputPlayerInquiry();
        return;
    }

}




//want some space to work on this function, will move later

const showdown = () => {

    for (let i = 0; i < playerObjectArray.length; i++) {
        
        //for the players that remain, add a new object property consisting of that player's seven showdown cards
        if (playerObjectArray[i].inGame === true) {
            playerObjectArray[i].showdownCards = [];
            for (let j = 0; j < 5; j++) {
                playerObjectArray[i].showdownCards.push(board[j]);
            }
            playerObjectArray[i].showdownCards.push(playerObjectArray[i].cards[0]);
            playerObjectArray[i].showdownCards.push(playerObjectArray[i].cards[1]);
        }

    }

}

const pair = () => {



}


/* Big remaining tasks: 

- showdown function
- side pot situation
- all-in before the last round


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

Edge case 2: P1 raises 500. P2 raises all-in for 700. The minRaise is is still 500. P1 is not allowed to re-raise
unless another player re-raises (that's what the above comment references). But now, if P3 wants to re-raise, is the
minimum 1000 or 1200? Assuming 1200 for now.
*/