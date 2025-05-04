const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Register a device token (requires authentication)
router.post(
  '/register',
  authenticateToken,
  notificationController.registerToken
);

// Unregister a device token (requires authentication)
router.post(
  '/unregister',
  authenticateToken,
  notificationController.unregisterToken
);

// Send notification to a user (admin only)
router.post(
  '/send',
  authenticateToken,
  notificationController.sendNotification
);

// Send notifications to multiple users (admin only)
router.post(
  '/send-bulk',
  authenticateToken,
  notificationController.sendBulkNotifications
);

// Test endpoint (Remove in production)
router.post(
  '/test',
  authenticateToken,
  notificationController.testNotification
);

module.exports = router;
