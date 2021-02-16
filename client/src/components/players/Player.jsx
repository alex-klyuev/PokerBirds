// TO-DO: refactor min bet to be part of the message box

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import PlayerActions from './PlayerActions';
import GF from '../../gameLogic/gameFunctions';

const Container = styled.div`
  width: 144px;
  height: 300px;
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
  let minBetView = <Text />;
  let playerActionView = <PlayerActions empty />;
  if (!player.inGame) {
    cardView = <CardBox />;
  } else if (player.ID === turn + 1 && player.cards[0].length !== 0) {
    // the && above is a janky way of handling game initialization
    cardView = (
      <CardBox>
        <CardContainer>
          <img alt="" className="card" src={`lib/cards/${GF.beautifyCard(player.cards[0])}.svg`} />
        </CardContainer>
        <CardContainer>
          <img alt="" className="card" src={`lib/cards/${GF.beautifyCard(player.cards[1])}.svg`} />
        </CardContainer>
      </CardBox>
    );

    // TO-DO: refactor min bet to be part of the message box
    minBetView = (
      <Text>
        Min bet: $
        {GF.convertToDollars(minBet)}
      </Text>
    );

    playerActionView = <PlayerActions empty={false} player={player} />;
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

  const potCommitmentView = (player.potCommitment === 0) ? <Text /> : (
    <Text>
      $
      {GF.convertToDollars(player.potCommitment)}
    </Text>
  );

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
      {potCommitmentView}
      {minBetView}
      {playerActionView}
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
