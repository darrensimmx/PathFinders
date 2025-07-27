// For Authentication/login feature: routes for /signup and /login
const express = require('express');
const router = express.Router();
const { login, signUp, forgotPassword, resetPassword } = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');


router.post('/login', async (req, res) => {
  const { email, password, rememberMe } = req.body;
  const result = await login({ email, password, rememberMe });

  let httpStatus;
  if (result.status === 'success') {
    httpStatus = 200;

    // If refreshToken exists, store in HTTP-only cookie
    if (result.refreshToken) {
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: false, // true if HTTPS in production
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
    }
  } else if (result.message.includes('Missing credentials')) {
    httpStatus = 400;
  } else if (result.message.includes('not found')) {
    httpStatus = 404;
  } else if (result.message.includes('Incorrect password')) {
    httpStatus = 401; // Unauthorized
  } else {
    httpStatus = 400;
  }

  res.status(httpStatus).json(result);
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

router.post('/refresh-token', async (req, res) => {
  const jwt = require('jsonwebtoken'); 
  const { SECRET } = require('../config'); 

  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ status: 'error', message: 'No refresh token' });
  }

  try {
    const payload = jwt.verify(refreshToken, SECRET);
    const newAccessToken = jwt.sign({ id: payload.id }, SECRET, { expiresIn: '15m' });
    res.json({ status: 'success', accessToken: newAccessToken });
  } catch (err) {
    console.error(err);
    res.status(403).json({ status: 'error', message: 'Invalid or expired refresh token' });
  }
});

// Add reset-password route
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  const result = await resetPassword({ token, password });
  const statusCode = result.status === 'success' ? 200 : 400;
  res.status(statusCode).json(result);
});

module.exports = router;
