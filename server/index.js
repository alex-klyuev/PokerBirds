/* eslint-disable no-console */
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}...`);
});
