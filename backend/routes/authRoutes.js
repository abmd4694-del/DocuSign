const express = require('express');
const { register, login, getMe, verifyEmail, resendVerificationCode } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-code', resendVerificationCode);
router.get('/me', protect, getMe);

module.exports = router;
