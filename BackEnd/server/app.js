// BackEnd/server/app.js

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const mongoose = require('mongoose')
const routeRouter = require('./routes/route')
const authRoutes = require('./routes/authRoutes')

const ORS_KEY = process.env.ORS_API_KEY;
if (!ORS_KEY) {
  console.error('ERROR: ORS_API_KEY not set in .env');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

//Connect to mongoose 
mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log("Connected to MongoDB"))
        .catch(err => console.error("MongoDB Connection error: ", err))

// Route to login page
app.use('/api', authRoutes);

// Unified route handler (direct and loop)
app.use('/api/route', routeRouter);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'OK' }));

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
