import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import EndGame from './table/EndGame';

const Container = styled.div`
  height: 100px;
  width: 100vw;
  margin-top: 30px;
`;

const Line = styled.h2`
  height: 20px;
  text-align: center;
`;

const MessageBox = (props) => {
  const { message, endGame } = props;
  const lines = message.split('\n');
  return (
    <Container>
      {lines.map((line) => <Line key={line}>{line}</Line>)}
      <Line>
        <EndGame endGame={endGame} />
      </Line>
    </Container>
  );
};

MessageBox.propTypes = {
  message: PropTypes.string.isRequired,
  endGame: PropTypes.func.isRequired,
};

export default MessageBox;
