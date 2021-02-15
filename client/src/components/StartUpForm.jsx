// TO-DO: enable form submitting using enter key

/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';

class StartUpForm extends React.Component {
  // validation functions
  static validateNumPlayers(input) {
    if (input.length > 1 || input === '') {
      alert('Please enter a valid input');
      return false;
    }
    const numPlayers = parseInt(input, 10);
    if (numPlayers < 2 || numPlayers > 8 || Number.isNaN(numPlayers)) {
      alert('Please enter a valid input');
      return false;
    }
    return true;
  }

  static validateBuyIn(input) {}

  static validateSmallBlind(input) {}

  static validateBigBlind(input) {}

  constructor(props) {
    super(props);

    this.state = {
      numPlayers: '',
      buyIn: '',
      smallBlind: '',
      bigBlind: '',
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  render() {
    const {
      registerNumPlayers,
      registerBuyIn,
      registerSmallBlind,
      registerBigBlind,
    } = this.props;

    const {
      numPlayers,
      buyIn,
      smallBlind,
      bigBlind,
    } = this.state;

    return (
      <div>
        <h4>Number of players, between 2 to 8:</h4>
        <form onSubmit={(e) => {
          if (!StartUpForm.validateNumPlayers(numPlayers)) {
            return;
          }
          registerNumPlayers(numPlayers);
          e.preventDefault();
        }}
        >
          <input name="numPlayers" onChange={this.handleInputChange} />
          <button
            type="button"
            onClick={() => {
              if (!StartUpForm.validateNumPlayers(numPlayers)) {
                return;
              }
              registerNumPlayers(numPlayers);
            }}
          >
            Enter
          </button>
        </form>
        <h4>Buy-in:</h4>
        <form onSubmit={(e) => {
          if (!StartUpForm.validateBuyIn(buyIn)) {
            return;
          }
          registerBuyIn(buyIn);
          e.preventDefault();
        }}
        >
          <input name="buyIn" onChange={this.handleInputChange} />
          <button
            type="button"
            onClick={() => {
              if (!StartUpForm.validateBuyIn(buyIn)) {
                return;
              }
              registerBuyIn(buyIn);
            }}
          >
            Enter
          </button>
          <div>Buy-ins must be in dollar increments.</div>
          <div>The minimum buy-in is 20 times the big blind and the maximum is $999.</div>
        </form>
        <h4>Small blind:</h4>
        <form onSubmit={(e) => {
          if (!StartUpForm.validateSmallBlind(smallBlind)) {
            return;
          }
          registerSmallBlind(smallBlind);
          e.preventDefault();
        }}
        >
          <input name="smallBlind" onChange={this.handleInputChange} />
          <button
            type="button"
            onClick={() => {
              if (!StartUpForm.validateSmallBlind(smallBlind)) {
                return;
              }
              registerSmallBlind(smallBlind);
            }}
          >
            Enter
          </button>
        </form>
        <h4>Big blind:</h4>
        <form onSubmit={(e) => {
          if (!StartUpForm.validateBigBlind(bigBlind)) {
            return;
          }
          registerBigBlind(bigBlind);
          e.preventDefault();
        }}
        >
          <input name="bigBlind" onChange={this.handleInputChange} />
          <button
            type="button"
            onClick={() => {
              if (!StartUpForm.validateBigBlind(bigBlind)) {
                return;
              }
              registerBigBlind(bigBlind);
            }}
          >
            Enter
          </button>
        </form>
        <div>Game Rules:</div>
        <div>Blinds and bets can be in increments of cents, but be sure to input them as decimals.</div>
        <div>The small blind will be the smallest chip size, so the big blind and all bets must be multiples of that.</div>
      </div>
    );
  }
}

StartUpForm.propTypes = {
  registerNumPlayers: PropTypes.func.isRequired,
  registerBuyIn: PropTypes.func.isRequired,
  registerSmallBlind: PropTypes.func.isRequired,
  registerBigBlind: PropTypes.func.isRequired,
};

export default StartUpForm;
