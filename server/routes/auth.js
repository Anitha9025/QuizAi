
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '24h'
  });
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }
    
    // Normalize email to lowercase to match schema
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log('Registration attempt:', { name, email: normalizedEmail, role });
    
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email: normalizedEmail, password, role });
    console.log('User created successfully:', user._id);
    
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Normalize email to lowercase to match schema
    const normalizedEmail = email.toLowerCase().trim();
    
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    
    if (!user) {
      console.log('Login failed: User not found for email:', normalizedEmail);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('Login failed: Invalid password for email:', normalizedEmail);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user._id);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET endpoint to view all users (for development/testing purposes)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude passwords from response
    res.status(200).json({
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

