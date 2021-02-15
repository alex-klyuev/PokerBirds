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

const PlayerContainer = (props) => (
  <Container>
    <Player />
    <Player />
    <Player />
  </Container>
);

export default PlayerContainer;
