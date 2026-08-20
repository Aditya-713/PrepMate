const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    
    // Attach user information to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };

    // Optionally check if user exists in database if DB connected
    try {
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (user) {
        req.user.role = user.role;
        req.user.name = user.name;
      }
    } catch (dbErr) {
      // Continue with token payload if DB lookup fails
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed or token expired.',
    });
  }
};

module.exports = { protect };
