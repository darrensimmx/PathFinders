import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// 1) Import Tailwind + custom CSS (locks height, flex layout, etc.)
import './index.css';

// 2) Import Leaflet’s CSS so the map tiles and controls show up
import 'leaflet/dist/leaflet.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

