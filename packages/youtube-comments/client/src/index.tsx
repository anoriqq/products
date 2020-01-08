import React from 'react';
import ReactDOM from 'react-dom';

import './app.css';
import { App } from './App';

localStorage.debug = '*,-socket.io-client:socket,-socket.io-parser,-engine.io-client:socket,-engine.io-client:polling'; // For debugging

ReactDOM.render(<App/>, document.getElementById('root'));
