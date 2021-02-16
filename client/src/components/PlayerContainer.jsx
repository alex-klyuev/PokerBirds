import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Player from './players/Player';

const Container = styled.div`
  display: flex;
  justify-content: space-around;
  height: 300px;
  width: 100vw;
  padding-left: 15px;
  padding-right: 15px;
  box-sizing: border-box;
`;

const PlayerContainer = (props) => {
  const {
    PG,
    handleRaise,
  } = props;

  return (
    <Container>
      {PG.playerObjectArray.map((player) => (
        <Player
          key={player.ID}
          player={player}
          deckColor={PG.deckColor}
          turn={PG.turn}
          minBet={PG.previousBet + PG.minRaise}
          handleRaise={handleRaise}
        />
      ))}
    </Container>
  );
};

PlayerContainer.propTypes = {
  PG: PropTypes.shape(/* fill me in */).isRequired,
  handleRaise: PropTypes.func.isRequired,
};

export default PlayerContainer;
