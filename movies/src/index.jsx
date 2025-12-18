import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import axios from 'axios';
import { Provider } from 'react-redux';
import { store } from './store';

const root = ReactDOM.createRoot(document.getElementById('root'));

// --- FIX START ---
// Check Vite's native env AND the old standard, then fallback to localhost
const BASE_URL = import.meta.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:5000';

axios.defaults.baseURL = BASE_URL;

// Optional: Log this so you can debug in the browser console
console.log("🚀 Frontend connected to:", BASE_URL);
// --- FIX END ---

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);