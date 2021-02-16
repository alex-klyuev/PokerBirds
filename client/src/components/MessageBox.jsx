import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Container = styled.h2`
  height: 100px;
  width: 100vw;
  text-align: center;
`;

const MessageBox = (props) => (
  <Container>{props.message}</Container>
);

MessageBox.propTypes = {
  message: PropTypes.string.isRequired,
};

export default MessageBox;
