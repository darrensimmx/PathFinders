// BackEnd/server/app.js

require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors    = require('cors');
const routeGeneratorRouter = require('./routes/routeGeneratorRoutes')
const savedRoutes = require('./routes/savedRoutesRoutes')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const cookieParser = require('cookie-parser'); // jwt helper
const protectedRoutes = require('./routes/protectedRoutes')

const ORS_KEY = process.env.ORS_API_KEY;
if (!ORS_KEY) {
  console.error('ERROR: ORS_API_KEY not set in .env');
  process.exit(1);
}

const app = express();
const corsOptions = {
  origin: 'http://127.0.0.1:5173',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser())

// //Connect to mongoose 
// mongoose.connect(process.env.MONGO_URI)
//         .then(() => console.log("Connected to MongoDB"))
//         .catch(err => console.error("MongoDB Connection error: ", err))

// Route to login/signup page defined in authRoutes
app.use('/api', authRoutes);
app.use('/api', protectedRoutes);
app.use('/api', userRoutes)
app.use('/api/saved-routes', savedRoutes)

// Unified route handler (direct and loop)
app.use('/api/route', routeGeneratorRouter);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'OK' }));

module.exports = app;
