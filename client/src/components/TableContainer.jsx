import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Board from './table/Board';
import Pot from './table/Pot';

const Container = styled.div`
  display: flex;
  justify-content: space-around;
  height: 500px;
  width: 100vw;
  padding-left: 15px;
  padding-right: 15px;
  box-sizing: border-box;
`;

const TableContainer = (props) => {

  return (
    <Container>
      <div>
        <Board />
        <Pot />
      </div>
    </Container>
  );
}

export default TableContainer;
