const Player = require('../gameLogic/Player');

const target = new Player(1);

console.log(target);

const source = {
  stack: 1000,
};

// we want to make a new player instance,
// then overwrite its properties with the data from the database

Object.assign(target, source);

console.log(target);
