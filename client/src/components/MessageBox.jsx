import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Container = styled.div`
  height: 100px;
  width: 100vw;
`;

const Line = styled.h2`
  height: 20px;
  text-align: center;
`;

const MessageBox = (props) => {
  const { message } = props;
  const lines = message.split('\n');
  return (
    <Container>
      {lines.map((line) => <Line>{line}</Line>)}
    </Container>
  );
};

MessageBox.propTypes = {
  message: PropTypes.string.isRequired,
};

export default MessageBox;
