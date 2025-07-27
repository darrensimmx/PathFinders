const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const User = require('../models/userModel');

router.patch('/users/:id', upload.single('profileImage'), async (req, res) => {
  console.log('PATCH /users/:id called with id =', req.params.id);
  try {
    const { name, username, bio } = req.body;
    const updateFields = { name, username, bio };

    if (req.file) {
      updateFields.profileImage = req.file.buffer.toString('base64');
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );
    console.log('Updated user:', updatedUser);
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating user' });
  }
});


router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching user' });
  }
});


router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // assuming req.user is set by the auth middleware
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error in /me route:', err);
    res.status(500).json({ message: 'Server error fetching user' });
  }
});

module.exports = router;