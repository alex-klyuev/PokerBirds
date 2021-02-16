/* eslint-disable no-alert */
// REMOVE THIS LATER:
/* eslint-disable react/no-unused-state */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Container = styled.div`
  width: 100px;
  height: 200px;
`;

class Player extends React.Component {
  constructor(props) {
    super(props);

    const { buyIn } = this.props;

    this.state = {
      stack: buyIn,
      cards: [[], []],
      actionState: '',
      potCommitment: 0,
      inGame: true,
      showdownRank: [],
    };
  }

  raise(bet) {
    const { ID, handleRaise } = this.props;
    let { potCommitment, stack, actionState } = this.state;

    // since user inputs total bet, the raise amount is
    // the difference between the bet and player's pot commitment
    const raiseAmount = bet - potCommitment;

    // increment stack and validate that raise is allowed
    stack -= raiseAmount;

    // TEST THIS USE CASE
    if (stack < 0) {
      alert(`Player ${ID} cannot bet ${bet} because their stack would go negative.`);
      return;
    }

    // increment pot commitment and update action state
    potCommitment += raiseAmount;

    // player state to be updated: stack, potcommitment, and actionstate
    // game state to be updated: action state, pot, min raise, previousBet, allowCheck

    // since two state updates are async,
    // game state update will be a callback to player state update
    this.setState({
      stack,
      potCommitment,
    }, () => {
      handleRaise(bet, raiseAmount);
    });
  }

  render() {
    return (
      <div>
        <div>{this.state.stack}</div>
        <Container>Player</Container>
      </div>
    );
  }
}

Player.propTypes = {
  ID: PropTypes.number.isRequired,
  buyIn: PropTypes.number.isRequired,
  handleRaise: PropTypes.func.isRequired,
};

export default Player;
