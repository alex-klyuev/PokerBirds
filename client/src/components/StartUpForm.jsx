/* eslint-disable no-alert */
// TO-DO: enable form submitting using enter key

/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import GF from '../gameLogic/gameFunctions';

const Input = styled.span`
  color: blue;
`;

// This class has the same 4 variable names for the input variables twice;
// once from props and once from state. The state controls the forms,
// and App manages the actual game state including these 4 variables.
// The props are passed down from the "App" state for use in user input validation here

class StartUpForm extends React.Component {
  // validation functions that don't require reference to instance

  static validateNumPlayers(input) {
    const numPlayers = Number(input);
    if (Number.isNaN(numPlayers) || !Number.isInteger(numPlayers) || numPlayers < 2 || numPlayers > 8) {
      alert('Please enter a valid input');
      return false;
    }
    return true;
  }

  static validateBuyIn(input) {
    const buyIn = Number(input);
    if (Number.isNaN(buyIn) || !Number.isInteger(buyIn) || buyIn < 1 || buyIn > 999) {
      alert('Please enter a valid input');
      return false;
    }
    return true;
  }

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

  // validation functions that do require reference to instance
  validateSmallBlind(input) {
    const { buyIn } = this.props;
    if (buyIn === -1) {
      alert('Please enter a buy-in first');
      return false;
    }
    const smallBlind = GF.convertToCents(Number(input));
    if (Number.isNaN(smallBlind) || !Number.isInteger(smallBlind) || smallBlind < 1 || smallBlind > buyIn / 20) {
      alert('Please enter a valid input\n(make sure your blind is at max 1/20th of the buy-in)');
      return false;
    }
    return true;
  }

  validateBigBlind(input) {
    const { buyIn, smallBlind } = this.props;
    if (buyIn === -1) {
      alert('Please enter a buy-in first');
      return false;
    }
    const bigBlind = GF.convertToCents(Number(input));
    if (Number.isNaN(bigBlind) || !Number.isInteger(bigBlind) || bigBlind < 1 || bigBlind > buyIn / 20) {
      alert('Please enter a valid input\n(make sure your blind is at max 1/20th of the buy-in)');
      return false;
    }

    if (smallBlind > bigBlind || bigBlind % smallBlind !== 0) {
      alert('Make sure your big blind is a multiple of the small blind');
      return false;
    }
    return true;
  }

  validateAll() {
    const {
      numPlayers,
      buyIn,
      smallBlind,
      bigBlind,
    } = this.props;
    if (numPlayers === 0 || buyIn === -1 || smallBlind === -1 || bigBlind === -1) {
      alert('Please fill out all fields');
      return false;
    }
    return true;
  }

  clearForm(field) {
    this.setState({
      [field]: '',
    });
  }

  renderInput(field) {
    const {
      numPlayers,
      buyIn,
      smallBlind,
      bigBlind,
    } = this.props;
    const inputs = {
      numPlayers,
      buyIn: GF.convertToDollars(buyIn),
      smallBlind: GF.convertToDollars(smallBlind),
      bigBlind: GF.convertToDollars(bigBlind),
    };

    // show nothing if field is not initialized yet; otherwise show their choice
    if (inputs[field] === 0) {
      return null;
    }
    return (
      <Input>{inputs[field]}</Input>
    );
  }

  render() {
    const {
      registerNumPlayers,
      registerBuyIn,
      registerSmallBlind,
      registerBigBlind,
      startGame,
    } = this.props;

    const {
      numPlayers,
      buyIn,
      smallBlind,
      bigBlind,
    } = this.state;

    return (
      <div>
        <h4>
          Number of players, between 2 to 8:
          <span> </span>
          {this.renderInput('numPlayers')}
        </h4>
        <form onSubmit={(e) => {
          if (!StartUpForm.validateNumPlayers(numPlayers)) {
            e.preventDefault();
            return;
          }
          registerNumPlayers(numPlayers);
          this.clearForm('numPlayers');
          e.preventDefault();
        }}
        >
          <input name="numPlayers" value={numPlayers} onChange={this.handleInputChange} />
          <button
            type="button"
            onClick={() => {
              if (!StartUpForm.validateNumPlayers(numPlayers)) {
                return;
              }
              registerNumPlayers(numPlayers);
              this.clearForm('numPlayers');
            }}
          >
            Enter
          </button>
        </form>
        <h4>
          Buy-in:
          <span> </span>
          {this.renderInput('buyIn')}
        </h4>
        <form onSubmit={(e) => {
          if (!StartUpForm.validateBuyIn(buyIn)) {
            e.preventDefault();
            return;
          }
          registerBuyIn(buyIn);
          this.clearForm('buyIn');
          e.preventDefault();
        }}
        >
          <input name="buyIn" value={buyIn} onChange={this.handleInputChange} />
          <button
            type="button"
            onClick={() => {
              if (!StartUpForm.validateBuyIn(buyIn)) {
                return;
              }
              registerBuyIn(buyIn);
              this.clearForm('buyIn');
            }}
          >
            Enter
          </button>
          <div>Buy-ins must be in dollar increments.</div>
          <div>The minimum buy-in is 20 times the big blind and the maximum is $999.</div>
        </form>
        <h4>
          Small blind:
          <span> </span>
          {this.renderInput('smallBlind')}
        </h4>
        <form onSubmit={(e) => {
          if (!this.validateSmallBlind(smallBlind)) {
            e.preventDefault();
            return;
          }
          registerSmallBlind(smallBlind);
          this.clearForm('smallBlind');
          e.preventDefault();
        }}
        >
          <input name="smallBlind" value={smallBlind} onChange={this.handleInputChange} />
          <button
            type="button"
            onClick={() => {
              if (!this.validateSmallBlind(smallBlind)) {
                return;
              }
              registerSmallBlind(smallBlind);
              this.clearForm('smallBlind');
            }}
          >
            Enter
          </button>
        </form>
        <h4>
          Big blind:
          <span> </span>
          {this.renderInput('bigBlind')}
        </h4>
        <form onSubmit={(e) => {
          if (!this.validateBigBlind(bigBlind)) {
            e.preventDefault();
            return;
          }
          registerBigBlind(bigBlind);
          this.clearForm('bigBlind');
          e.preventDefault();
        }}
        >
          <input name="bigBlind" value={bigBlind} onChange={this.handleInputChange} />
          <button
            type="button"
            onClick={() => {
              if (!this.validateBigBlind(bigBlind)) {
                return;
              }
              registerBigBlind(bigBlind);
              this.clearForm('bigBlind');
            }}
          >
            Enter
          </button>
        </form>
        <div>Game Rules:</div>
        <div>Blinds and bets can be in increments of cents, but be sure to input them as decimals.</div>
        <div>The small blind will be the smallest chip size, so the big blind and all bets must be multiples of that.</div>
        <button
          type="button"
          onClick={() => {
            if (!this.validateAll()) {
              return;
            }
            startGame();
          }}
        >
          Play!
        </button>
      </div>
    );
  }
}

StartUpForm.propTypes = {
  registerNumPlayers: PropTypes.func.isRequired,
  registerBuyIn: PropTypes.func.isRequired,
  registerSmallBlind: PropTypes.func.isRequired,
  registerBigBlind: PropTypes.func.isRequired,
  startGame: PropTypes.func.isRequired,
  numPlayers: PropTypes.number.isRequired,
  buyIn: PropTypes.number.isRequired,
  smallBlind: PropTypes.number.isRequired,
  bigBlind: PropTypes.number.isRequired,
};

export default StartUpForm;
