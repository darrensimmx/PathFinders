// BackEnd/server/app.js

const express = require('express');
const cors = require('cors');
const routeRouter = require('./routes/route');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check route (optional)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Main route handler
app.use('/generateRoute', routeRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:4000`);
});

/* ESM version 
import express from 'express';
import cors from 'cors';

// (If you have route-generation logic in another file, import it here)
// import generateRoute from './utils/generateRoute.js';

const app = express();
const PORT = process.env.PORT || 4000;

// 1) Enable CORS so your React app can call us
app.use(cors());

// 2) Parse JSON bodies
app.use(express.json());

// 3) Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// 4) Route-generation endpoint
app.post('/api/route', (req, res) => {
  const { start, end, distance } = req.body;

  // TODO: replace this stub with your real algorithm
  // For now we return a little straight-line path
  const coords = [
    [1.3521, 103.8198],
    [1.3550, 103.8200],
    [1.3580, 103.8250],
  ];

  res.json({ coords });
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
*/