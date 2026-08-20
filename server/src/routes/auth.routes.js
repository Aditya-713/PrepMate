const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const { signupSchema, loginSchema, validateRequest } = require('../utils/validators');

router.post('/signup', authLimiter, validateRequest(signupSchema), signup);
router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.get('/me', protect, getMe);

module.exports = router;
