import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

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

const Pot = (props) => (
  <OuterContainer>
    <div>
      <PotContainer>
        $150
      </PotContainer>
      <Text>
        Pot
      </Text>
    </div>
  </OuterContainer>
);

Pot.propTypes = {

};

export default Pot;
