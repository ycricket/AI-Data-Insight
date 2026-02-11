import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Leaflet CSS needs to be available globally or imported here if using a bundler that supports CSS imports.
// In this environment, it's loaded via CDN in index.html, which is handled externally.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);