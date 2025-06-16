// For Authentication/login feature: routes for /signup and /login
const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

router.post('/login', async (req, res) => {
  const result = await login(req.body); // pass in relevant data only
  return res.json(result) // respond to client
});

module.exports = router;
