const express = require('express');
const router = express.Router();
const { handleStripeWebhook } = require('../controllers/webhook.controller');

// Important: Use express.raw for Stripe webhooks
// This must come BEFORE any JSON parsing middleware
router.post('/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router; 