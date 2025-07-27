// BackEnd/server/server.js

const path = require('path');
// explicitly load the .env file in this directory
require('dotenv').config({
  path: path.resolve(__dirname, '.env')
});

const mongoose = require('mongoose');
const app      = require('./app');

const PORT = process.env.PORT || 4000;

// confirm that the expected URI is loaded
console.log('MONGO_URI =', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser:    true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err.message));

// start the HTTP server regardless of DB outcome
app.listen(PORT, () => {
  console.log(`Server running at port ${port}`);
});
