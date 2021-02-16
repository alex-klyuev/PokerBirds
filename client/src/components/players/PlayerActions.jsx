import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Container = styled.div`
  width: 144px;
  height: 90px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-around;
  height: 30px;
`;

const Button = styled.button`
  height: 25px;
  width: 60px;
`;

const Input = styled.input`
  width: 120px;
  height: 24px;
  margin: 2px 10px;
`;

class PlayerActions extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(e) {
    this.setState({
      value: e.target.value,
    });
  }

  render() {
    const { empty } = this.props;

    if (empty) {
      return <Container />;
    }

    return (
      <Container>
        <Row>
          <Button type="button">
            Fold
          </Button>
          <Button type="button">
            Check
          </Button>
        </Row>
        <Row>
          <Button type="button">
            Call
          </Button>
          <Button type="button">
            Raise
          </Button>
        </Row>
        <Row>
          <Input placeholder="Raise amount..." onChange={this.handleInputChange} />
        </Row>
      </Container>
    );
  }
};

PlayerActions.propTypes = {
  empty: PropTypes.bool.isRequired,
  player: PropTypes.shape(/* fill me in */).isRequired,
};

export default PlayerActions;
