// For Authentication/login feature: routes for /signup and /login
const express = require('express');
const router = express.Router();
const { login, signUp } = require('../controllers/authController');

router.post('/login', async (req, res) => {
  const result = await login(req.body); // pass in relevant data only
  return res.json(result) // respond to client
});

router.post('/signup', async (req, res) => {
  const result = await signUp(req.body);
  return res.json(result);
})

module.exports = router;
