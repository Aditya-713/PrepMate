const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');

// In-memory fallback for environment testing if DB is unavailable
const memoryUsers = new Map();

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res, next) => {
  try {
    const { name, email, password, role, adminCode } = req.body;

    let userRole = role === 'admin' ? 'admin' : 'user';
    if (adminCode && adminCode === env.ADMIN_SIGNUP_CODE) {
      userRole = 'admin';
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let user;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      try {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'An account with this email already exists.',
          });
        }

        user = await User.create({
          name,
          email: email.toLowerCase(),
          passwordHash,
          role: userRole,
        });
      } catch (dbErr) {
        // Fallback to memory
      }
    }

    if (!user) {
      if (memoryUsers.has(email.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists.',
        });
      }
      user = {
        _id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name,
        email: email.toLowerCase(),
        role: userRole,
        passwordHash,
        createdAt: new Date(),
      };
      memoryUsers.set(email.toLowerCase(), user);
    }

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let user;
    let isMatch = false;

    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
        if (user) {
          isMatch = await user.matchPassword(password);
        }
      } catch (dbErr) {
        // Fallback to memory
      }
    }

    // Check memory store fallback if DB did not return user
    if (!user && memoryUsers.has(email.toLowerCase())) {
      user = memoryUsers.get(email.toLowerCase());
      isMatch = await bcrypt.compare(password, user.passwordHash);
    }

    if (!user || !isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, getMe, memoryUsers };
