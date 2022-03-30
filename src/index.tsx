import React from 'react';
import ReactDOM from 'react-dom';
import './assets/styles/index.scss';
import App from './App';
import ReactGA4 from "react-ga4";
/* import vconsole from 'vconsole'
new vconsole() */
ReactGA4.initialize('G-GYJBL2WBZZ')
ReactDOM.render(<App />,document.getElementById('root'));