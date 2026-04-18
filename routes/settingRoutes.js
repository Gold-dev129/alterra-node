const express = require('express');
const settingController = require('../controllers/settingController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Publicly accessible settings
router.get('/', settingController.getSettings);

// Admin only updates
router.patch('/', authMiddleware.protect, authMiddleware.restrictTo('admin'), settingController.updateSetting);

module.exports = router;
