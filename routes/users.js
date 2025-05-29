const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();


router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});


router.put('/profile', auth, async (req, res) => {
  try {
    const { name, role } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, role },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

module.exports = router;