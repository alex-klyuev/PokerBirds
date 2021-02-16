import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
// GF = game functions
import GF from '../../gameLogic/gameFunctions';

const Container = styled.div`
  width: 100px;
  height: 200px;
`;

const Player = (props) => {
  const { player } = props;

  return (
    <div>
      <div>{GF.convertToDollars(player.stack)}</div>
      <Container>Player</Container>
    </div>
  );
};

Player.propTypes = {
  player: PropTypes.shape(/* fill me in */).isRequired,
};

export default Player;
