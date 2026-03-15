const User = require('../models/User');
const SiteSettings = require('../models/SiteSettings');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const Transaction = require('../models/Transaction');
    await Transaction.deleteMany({ user: user._id });
    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Ban / Unban user
// @route   PUT /api/admin/users/:id/ban
// @access  Private/Admin
const toggleBanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isBanned = !user.isBanned;
    await user.save();
    res.status(200).json({ success: true, isBanned: user.isBanned, message: user.isBanned ? 'User banned' : 'User unbanned' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get site settings
// @route   GET /api/admin/settings
// @access  Public (checked by all users on login)
const getSiteSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne({});
    if (!settings) {
      settings = await SiteSettings.create({ maintenanceMode: 'none' });
    }
    res.status(200).json({ success: true, maintenanceMode: settings.maintenanceMode });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update site settings (maintenance mode)
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSiteSettings = async (req, res) => {
  try {
    const { maintenanceMode } = req.body;
    if (!['none', '404', '500'].includes(maintenanceMode)) {
      return res.status(400).json({ success: false, message: 'Invalid mode' });
    }
    let settings = await SiteSettings.findOne({});
    if (!settings) {
      settings = await SiteSettings.create({ maintenanceMode });
    } else {
      settings.maintenanceMode = maintenanceMode;
      await settings.save();
    }
    res.status(200).json({ success: true, maintenanceMode: settings.maintenanceMode });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getUsers,
  deleteUser,
  toggleBanUser,
  getSiteSettings,
  updateSiteSettings
};
