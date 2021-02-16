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
    handlePlayerAction,
  } = props;

  return (
    <Container>
      {PG.playerObjectArray.map((player) => (
        <Player
          key={player.ID}
          player={player}
          PG={PG}
          handlePlayerAction={handlePlayerAction}
        />
      ))}
    </Container>
  );
};

PlayerContainer.propTypes = {
  PG: PropTypes.shape(/* fill me in */).isRequired,
  handlePlayerAction: PropTypes.func.isRequired,
};

export default PlayerContainer;
