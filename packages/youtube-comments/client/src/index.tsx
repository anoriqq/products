import React from 'react';
import ReactDOM from 'react-dom';

import { App } from './App';

localStorage.debug = 'app:*'; // For debugging

ReactDOM.render(<App/>, document.getElementById('root'));
