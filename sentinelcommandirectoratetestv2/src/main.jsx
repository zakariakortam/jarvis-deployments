import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Console styling for security simulation
console.log(
  '%c SENTINEL COMMAND DIRECTORATE ',
  'background: #ff0040; color: white; font-size: 20px; font-weight: bold; padding: 10px;'
);
console.log(
  '%c TOP SECRET // SCI // NOFORN ',
  'background: #ff4400; color: white; font-size: 12px; padding: 5px;'
);
console.log(
  '%c Unauthorized access is prohibited and will be prosecuted ',
  'color: #ff0040; font-size: 10px;'
);
console.log(
  '%c All activities are monitored and logged ',
  'color: #666; font-size: 10px;'
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
