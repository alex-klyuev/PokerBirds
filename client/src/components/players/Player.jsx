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

    this.state = {

    };
  }

  render() {
    return (
      <Container>Player</Container>
    );
  }
}

Player.propTypes = {
  id: PropTypes.number.isRequired,
};

export default Player;
