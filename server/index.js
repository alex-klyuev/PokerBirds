/* eslint-disable no-console */
const express = require('express');
const path = require('path');

// initialize and connect to database
require('../database');
const controller = require('./controller');

const app = express();
const PORT = 3000;
app.use(express.json());

// if they go direct to the website - will reroute to gameId = 0
app.use('/', express.static(path.join(__dirname, '..', 'public')));

app.use('/:gameId', express.static(path.join(__dirname, '..', 'public')));

app.get('/api/gamestate/:gameId', controller.getState);

app.post('/api/gamestate/:gameId', controller.updateState);

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}...`);
});
