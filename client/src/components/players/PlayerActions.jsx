/* eslint-disable no-alert */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import GF from '../../gameLogic/gameFunctions';

const Container = styled.div`
  width: 144px;
  height: 90px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-around;
  height: 30px;
`;

const Button = styled.button`
  height: 25px;
  width: 60px;
`;

const Input = styled.input`
  width: 120px;
  height: 24px;
  margin: 2px 10px;
`;

class PlayerActions extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(e) {
    this.setState({
      value: e.target.value,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  validatePlayerAction(input) {
    const { PG } = this.props;
    const { value } = this.state;
    const actionInput = input.slice(0, 4);
    let numericInput = value;

    // some imperfect inputs are allowed in this game for the sake of simplicity of the code.
    // it's designed so that player intent is never misunderstood, however
    // this else if statement both validates the input
    // and returns call, check, or fold if it's one of those.
    // if it's a raise, it goes on to the next section to validate the amount
    if (actionInput === 'call') {
      // validate that there is a raise on the board to be called.
      // Second part is to allow the SB to call
      // when it is not equal to the big blind

      let raiseCounter = 0;
      for (let i = 0; i < PG.playerObjectArray.length; i += 1) {
        // this allows the small blind to call big blind as well
        if (PG.playerObjectArray[i].actionState === 'raise' || (PG.playerObjectArray[i].actionState === 'SB')) {
          raiseCounter += 1;
        }
      }

      // exception for situation where small blind is equal to big blind; SB cannot call there
      // eslint-disable-next-line no-mixed-operators
      if (raiseCounter === 0 || PG.playerObjectArray[PG.turn].actionState === 'SB' && PG.smallBlind === PG.bigBlind) {
        alert('You cannot call here.');

        // TO-DO: NOT SURE HOW THESE RETURNS WILL PLAY OUT
        return { valid: false };
      }
      return {
        valid: true,
        playerAction: ['call', ''],
      };
    } if (actionInput === 'fold') {
      return {
        valid: true,
        playerAction: ['fold', ''],
      };
    } if (actionInput === 'chec') {
      // validate that player is allowed to check
      if (PG.allowCheck === false) {
        alert('You cannot check here.');
        return { valid: false };
      }
      return {
        valid: true,
        playerAction: ['check', ''],
      };
    } if (actionInput !== 'bet ') {
      return { valid: false };
    }

    // second input: verify that the raise is an increment of the small blind,
    // equal or above the minimum raise, and less than or equal to the player's stack.
    // exception is made if player bets stack; then bet gets through regardless of the min raise.
    numericInput = GF.convertToCents(parseFloat(numericInput));
    if (numericInput === PG.playerObjectArray[PG.turn].stack) {
      return {
        valid: true,
        playerAction: ['raise', numericInput],
      };
    }
    if (numericInput % PG.smallBlind !== 0
      || numericInput < PG.previousBet + PG.minRaise
      || numericInput > PG.playerObjectArray[PG.turn].stack
      + PG.playerObjectArray[PG.turn].potCommitment) {
      alert('You can\'t raise that amount.');
      return { valid: false };
    }
    return {
      valid: true,
      playerAction: ['raise', numericInput],
    };
  }

  render() {
    const { empty, handlePlayerAction } = this.props;

    if (empty) {
      return <Container />;
    }

    return (
      <Container>
        <Row>
          <Button
            type="button"
            onClick={() => {
              const inputAction = this.validatePlayerAction('fold');
              if (!inputAction.valid) {
                return;
              }
              handlePlayerAction(inputAction.playerAction);
            }}
          >
            Fold
          </Button>
          <Button
            type="button"
            onClick={() => {
              const inputAction = this.validatePlayerAction('check');
              if (!inputAction.valid) {
                return;
              }
              handlePlayerAction(inputAction.playerAction);
            }}
          >
            Check
          </Button>
        </Row>
        <Row>
          <Button
            type="button"
            onClick={() => {
              const inputAction = this.validatePlayerAction('call');
              if (!inputAction.valid) {
                return;
              }
              handlePlayerAction(inputAction.playerAction);
            }}
          >
            Call
          </Button>
          <Button
            type="button"
            onClick={() => {
              const inputAction = this.validatePlayerAction('bet ');
              if (!inputAction.valid) {
                return;
              }
              handlePlayerAction(inputAction.playerAction);
            }}
          >
            Bet
          </Button>
        </Row>
        <Row>
          <Input placeholder="Bet amount..." onChange={this.handleInputChange} />
        </Row>
      </Container>
    );
  }
}

PlayerActions.propTypes = {
  empty: PropTypes.bool.isRequired,
  PG: PropTypes.shape(/* fill me in */),
  handlePlayerAction: PropTypes.func,
};

PlayerActions.defaultProps = {
  PG: null,
  handlePlayerAction: null,
};

export default PlayerActions;
