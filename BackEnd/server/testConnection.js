// BackEnd/server/testConnection.js
const path     = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '.env')
});
const mongoose = require('mongoose');

console.log('Testing MONGO_URI:', process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser:    true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection failed:', err.message);
    process.exit(1);
  });
