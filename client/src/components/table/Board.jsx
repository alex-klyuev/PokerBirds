import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import GF from '../../gameLogic/gameFunctions';

const Deck = styled.div`
  height: 100px;
  margin: 10px 0px;
  display: flex;
  justify-content: center;
`;

const BoardContainer = styled.div`
  display: flex;
  width: 360px;
  height: 102px;
  justify-content: left;
`;

const CardContainer = styled.div`
  width: 72px;
  height: 100px;
  padding: 1px;
`;

const Board = (props) => {
  const { PG } = props;
  return (
    <div>
      <Deck>
        <CardContainer>
          <img alt="" className="card" src={`lib/cards/${PG.deckColor}_Back.svg`} />
        </CardContainer>
      </Deck>
      <BoardContainer>
        {PG.board.map((card) => {
          if (card === '') {
            return null;
          }
          return (
            <CardContainer key={card}>
              <img alt="" className="card" src={`lib/cards/${GF.beautifyCard(card)}.svg`} />
            </CardContainer>
          );
        })}
      </BoardContainer>
    </div>
  );
};

Board.propTypes = {
  PG: PropTypes.shape(/* fill me in */).isRequired,
};

export default Board;
