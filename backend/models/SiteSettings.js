const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  maintenanceMode: {
    type: String,
    enum: ['none', '404', '500'],
    default: 'none'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
