const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    console.log('📝 Registration attempt:', { fullName, email });

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      });
    }

    // Create new user
    const user = await User.create({
      fullName,
      email,
      phone,
      password,
    });

    if (user) {
      console.log('✅ User created successfully:', user.email);
      
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          bio: user.bio,
          memberSince: user.memberSince,
          token: generateToken(user._id),
        },
        message: 'User registered successfully'
      });
    }
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error creating user: ' + error.message 
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', email);

    // Check if user exists
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      console.log('✅ Login successful:', user.email);
      
      res.json({
        success: true,
        data: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          bio: user.bio,
          memberSince: user.memberSince,
          token: generateToken(user._id),
        },
        message: 'Login successful'
      });
    } else {
      console.log('❌ Login failed: Invalid credentials for', email);
      res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error during login: ' + error.message 
    });
  }
};

// Get current user profile
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(400).json({ 
      success: false,
      message: 'User not found' 
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};