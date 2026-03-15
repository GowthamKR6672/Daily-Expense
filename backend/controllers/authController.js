const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/email');
const { uploadImage } = require('../utils/cloudinary');

const generateToken = (id, role = 'user') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Request OTP for registration
// @route   POST /api/auth/register-request
const registerRequest = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  try {
    const userExists = await User.findOne({ email });
    if (userExists && userExists.isVerified) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    await OTP.findOneAndDelete({ email }); // Remove old OTP if exists
    await OTP.create({ email, otp });

    const message = `Your OTP for Expense Management App registration is: ${otp}\nThis OTP is valid for 5 minutes.`;

    await sendEmail({
      email,
      subject: 'Expense Management - Registration OTP',
      message
    });

    res.status(200).json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending OTP', error: error.message });
  }
};

// @desc    Verify OTP and create user
// @route   POST /api/auth/register-verify
const registerVerify = async (req, res) => {
  const { email, otp, name, password } = req.body;

  try {
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    let profilePictureUrl = '';
    if (req.file) {
      const result = await uploadImage(req.file.buffer);
      profilePictureUrl = result.secure_url;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let user = await User.findOne({ email });
    if (user) {
      // Update unverified user
      user.name = name;
      user.password = hashedPassword;
      user.profilePicture = profilePictureUrl;
      user.isVerified = true;
      await user.save();
    } else {
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        profilePicture: profilePictureUrl,
        isVerified: true
      });
    }

    await OTP.findOneAndDelete({ email });

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error verifying OTP', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for admin login
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      return res.status(200).json({
        success: true,
        user: { name: 'Admin', email, role: 'admin' },
        token: generateToken('admin', 'admin')
      });
    }

    const user = await User.findOne({ email });
    if (user && user.isVerified && (await bcrypt.compare(password, user.password))) {
      res.status(200).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture
        },
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials or unverified profile' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  if (req.user.role === 'admin') {
    return res.status(200).json({ success: true, user: req.user });
  }
  
  const user = await User.findById(req.user.id).select('-password');
  if (user) {
    res.status(200).json({ success: true, user });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
};

// @desc    Update user profile (name, password, profile picture)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { name, currentPassword, newPassword } = req.body;

    // Update name
    if (name) user.name = name;

    // Update profile picture if uploaded
    if (req.file) {
      const result = await uploadImage(req.file.buffer);
      user.profilePicture = result.secure_url;
    }

    // Update password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Please provide current password' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerRequest,
  registerVerify,
  loginUser,
  getMe,
  updateProfile
};
