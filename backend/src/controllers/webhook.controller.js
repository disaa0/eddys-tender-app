const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const orderService = require('../services/order.service');

/**
 * Handle Stripe webhook events
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
async function handleStripeWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Enhanced debugging
    console.log('Webhook received');
    console.log('Headers:', JSON.stringify(req.headers));
    console.log('Body type:', typeof req.body);
    console.log('Body is Buffer:', Buffer.isBuffer(req.body));
    console.log('Signature present:', !!sig);
    console.log('Secret configured:', !!endpointSecret);

    // Ensure we have a signature and secret
    if (!sig || !endpointSecret) {
        console.error('Missing webhook signature or secret');
        return res.status(400).json({
            error: 'Webhook Error: Missing signature or configuration'
        });
    }

    try {
        // Verify webhook signature
        const event = stripe.webhooks.constructEvent(
            req.body, // This should be the raw buffer thanks to express.raw middleware
            sig,
            endpointSecret
        );

        console.log(`Webhook verified and parsed: ${event.type}`);

        // Process the event
        const result = await orderService.processStripeEvent(event);

        // Return success response with details
        res.json({
            received: true,
            type: event.type,
            result
        });
    } catch (error) {
        console.error(`Webhook error: ${error.message}`);
        return res.status(400).json({
            error: `Webhook Error: ${error.message}`
        });
    }
}

module.exports = { handleStripeWebhook }; 
