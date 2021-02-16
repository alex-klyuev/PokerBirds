import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Player from './players/Player';

const Container = styled.div`
  display: flex;
  justify-content: space-around;
  height: 200px;
  width: 100vw;
  padding-left: 15px;
  padding-right: 15px;
  box-sizing: border-box;
`;

const PlayerContainer = (props) => {
  const {
    playerObjectArray,
    handleRaise,
  } = props;

  return (
    <Container>
      {playerObjectArray.map((player) => (
        <Player
          key={player.ID}
          player={player}
          handleRaise={handleRaise}
        />
      ))}
    </Container>
  );
};

PlayerContainer.propTypes = {
  handleRaise: PropTypes.func.isRequired,
  playerObjectArray: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
};

export default PlayerContainer;
