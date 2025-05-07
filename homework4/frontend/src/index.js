// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client'; 
import { BrowserRouter as Router } from 'react-router-dom'; 
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './msalConfig';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <MsalProvider instance={msalInstance}>  {}
    <Router>
      <App />  
    </Router>
  </MsalProvider>
);
