const GameState = require('../database/GameState');

const getState = (req, res) => {
  GameState.findById(req.params.gameId, (result) => {
    res.status(200).send(result);
  });
};

// at "start game" in front-end, will make a post request here.
// if id doesn't exist, this function will create a new game state
const updateState = (req, res) => {
  const options = {
    new: true,
    upsert: true,
  };
  const callback = (result) => {
    res.status(201).send(result);
  };
  GameState.findByIdAndUpdate(req.params.gameId, req.body, options, callback);
};

module.exports = {
  getState,
  updateState,
};
