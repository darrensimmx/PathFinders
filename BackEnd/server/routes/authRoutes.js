// For Authentication/login feature: routes for /signup and /login
const express = require('express');
const router = express.Router();
const { login, signUp, forgotPassword } = require('../controllers/authController');

router.post('/login', async (req, res) => {
  const result = await login(req.body); // pass in relevant data only
  return res.json(result) // respond to client
});

router.post('/signup', async (req, res) => {
  const result = await signUp(req.body);
  return res.json(result);
})

router.post('/forgot-password', async (req, res) => {
  const result = await forgotPassword({email: req.body.email});

  let httpStatus;
  if (result.status === 'success') {
    httpStatus = 200;
  } else if (result.message.includes('not found')) {
    httpStatus = 404;
  } else if (result.message.includes('required')) {
    httpStatus = 400;
  } else {
    httpStatus = 400
  }
  return res.status(httpStatus).json(result);
})

module.exports = router;
