import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import GF from '../../gameLogic/gameFunctions';

const OuterContainer = styled.div`
  margin-top: 30px;
  border-style: solid;
  border-radius: 2px;
  border-color: black;
  display: flex;
  justify-content: center;
  width: 360px;
  height: 150px;
`;

const PotContainer = styled.h3`
  padding: 25px;
  color: green;
`;

const Text = styled.h4`
  text-align: center;
`;

const Pot = (props) => {
  const { pot } = props;
  return (
    <OuterContainer>
      <div>
        <PotContainer>{`$${GF.convertToDollars(pot)}`}</PotContainer>
        <Text>Pot</Text>
      </div>
    </OuterContainer>
  );
};

Pot.propTypes = {
  pot: PropTypes.number.isRequired,
};

export default Pot;
