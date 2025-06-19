const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');

router.get('/protected', authenticateToken, (req, res) => {
  res.json({
    status: 'success',
    message: `Hello user ${req.user.id}, you accessed a protected route!`
  });
});

module.exports = router;
