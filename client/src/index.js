import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

const path = window.location.pathname;
const gameId = path.split('/')[1];

ReactDOM.render(<App gameId={gameId} />, document.getElementById('app'));
