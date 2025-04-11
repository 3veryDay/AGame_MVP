import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
console.log("🔁 React build version: v2 @ 2025-04-08, 9:51");

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>

    <App />
  </BrowserRouter>
);
