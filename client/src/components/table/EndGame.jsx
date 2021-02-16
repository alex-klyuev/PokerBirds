import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Button = styled.button`
  background-color: darkred;
  color: white;
  font-size: 16px;
  font-weight: 500;
  width: 120px;
  height: 40px;
  border-radius: 15px;
`;

const EndGame = (props) => {
  const { endGame } = props;
  return (
    <Button type="button" onClick={endGame}>End Game</Button>
  );
};

EndGame.propTypes = {
  endGame: PropTypes.func.isRequired,
};

export default EndGame;
