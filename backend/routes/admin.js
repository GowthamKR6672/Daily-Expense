const express = require('express');
const router = express.Router();
const { getUsers, deleteUser, toggleBanUser, getSiteSettings, updateSiteSettings } = require('../controllers/adminController');
const { adminProtect } = require('../middleware/auth');

// Public - users poll this to get maintenance mode
router.route('/settings').get(getSiteSettings);

// Admin only routes
router.route('/settings').put(adminProtect, updateSiteSettings);
router.route('/users').get(adminProtect, getUsers);
router.route('/users/:id').delete(adminProtect, deleteUser);
router.route('/users/:id/ban').put(adminProtect, toggleBanUser);

module.exports = router;
