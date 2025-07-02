import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (process.env.NODE_ENV === 'development' && !(window as any).electron) {
  (window as any).electron = {
    pingHost: async (host: string) => ({ time: Math.floor(Math.random() * 100) + 10 })
  };
} 