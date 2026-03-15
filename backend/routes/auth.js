const express = require('express');
const router = express.Router();
const { registerRequest, registerVerify, loginUser, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.post('/register-request', registerRequest);
router.post('/register-verify', upload.single('profilePicture'), registerVerify);
router.post('/login', loginUser);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('profilePicture'), updateProfile);

module.exports = router;
