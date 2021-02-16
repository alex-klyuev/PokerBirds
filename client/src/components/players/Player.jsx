import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
// GF = game functions
import GF from '../../gameLogic/gameFunctions';

const Container = styled.div`
  width: 144px;
  height: 215px;
`;

const CardBox = styled.div`
  display: flex;
`;

const CardContainer = styled.div`
  width: 72px;
  padding: 1px;
  height: 100px;
`;

const Text = styled.div`
  padding: 2px;
  font-weight: bold;
  height: 18px;
  margin-left: 5px;
`;

const Player = (props) => {
  const {
    player,
    deckColor,
    turn,
    minBet,
  } = props;

  // 3 card view options: player is out of the game,
  // player is in but not their turn, or it's player's turn
  let cardView;
  if (!player.inGame) {
    cardView = <CardBox />;
  } else if (player.ID === turn + 1) {
    cardView = (
      <CardBox>
        <CardContainer>
          <img alt="" className="card" src={`lib/cards/${deckColor}_Back.svg`} />
        </CardContainer>
        <CardContainer>
          <img alt="" className="card" src={`lib/cards/${deckColor}_Back.svg`} />
        </CardContainer>
      </CardBox>
    );;
  } else {
    cardView = (
      <CardBox>
        <CardContainer>
          <img alt="" className="card" src={`lib/cards/${deckColor}_Back.svg`} />
        </CardContainer>
        <CardContainer>
          <img alt="" className="card" src={`lib/cards/${deckColor}_Back.svg`} />
        </CardContainer>
      </CardBox>
    );
  }

  return (
    <Container>
      <Text>
        Player
        <span> </span>
        {player.ID}
      </Text>
      <Text>
        $
        {GF.convertToDollars(player.stack)}
      </Text>
      {cardView}
      <Text>
        {player.actionState}
      </Text>
      <Text>
        $
        {GF.convertToDollars(player.potCommitment)}
      </Text>
      <Text>
        Min bet: $
        {GF.convertToDollars(minBet)}
      </Text>
    </Container>
  );
};

Player.propTypes = {
  player: PropTypes.shape(/* fill me in */).isRequired,
  turn: PropTypes.number.isRequired,
  minBet: PropTypes.number.isRequired,
  deckColor: PropTypes.string.isRequired,
};

export default Player;
