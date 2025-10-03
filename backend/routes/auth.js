const express = require('express');
const {
  registerUser,
  loginUser,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', registerUser);

// POST /api/auth/login - Login user
router.post('/login', loginUser);

// GET /api/auth/me - Get current user (protected route)
router.get('/me', protect, getMe);

module.exports = router;
