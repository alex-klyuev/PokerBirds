// no styling for now...let's get the game functionality working

import React from 'react';
import StartUpForm from './StartUpForm';

class App extends React.Component {
  constructor() {
    super();

    this.state = {

    };

    this.registerNumPlayers = this.registerNumPlayers.bind(this);
    this.registerBuyIn = this.registerBuyIn.bind(this);
    this.registerSmallBlind = this.registerSmallBlind.bind(this);
    this.registerBigBlind = this.registerBigBlind.bind(this);
  }

  registerNumPlayers(value) {
    console.log(value);
  }

  registerBuyIn(value) {
    console.log(value);
  }

  registerSmallBlind(value) {
    console.log(value);
  }

  registerBigBlind(value) {
    console.log(value);
  }

  render() {
    return (
      <div>
        <div>Welcome to PokerBirds! 🐦</div>
        <StartUpForm
          registerNumPlayers={this.registerNumPlayers}
          registerBuyIn={this.registerBuyIn}
          registerSmallBlind={this.registerSmallBlind}
          registerBigBlind={this.registerBigBlind}
        />
      </div>
    );
  }
}

export default App;
