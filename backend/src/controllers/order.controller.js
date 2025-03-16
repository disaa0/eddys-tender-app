const orderService = require('../services/order.service');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a new order
async function createOrder(req, res) {
    try {
        const { idPaymentType, idShipmentType, idLocation } = req.body;
        const userId = req.user.userId;

        // Validate required fields
        if (!idPaymentType || !idShipmentType) {
            return res.status(400).json({
                message: 'Se requieren tipo de pago y tipo de envío'
            });
        }

        // Validate location for delivery orders
        if (parseInt(idShipmentType) === 1 && !idLocation) {
            return res.status(400).json({
                message: 'Se requiere una dirección de entrega para envíos a domicilio'
            });
        }

        const result = await orderService.createOrder(userId, {
            idPaymentType: parseInt(idPaymentType),
            idShipmentType: parseInt(idShipmentType),
            idLocation: idLocation ? parseInt(idLocation) : null
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('Create order error:', error);
        res.status(400).json({ message: error.message });
    }
}

// Get order details
async function getOrderDetails(req, res) {
    try {
        const orderId = parseInt(req.params.id);
        const userId = req.user.userId;

        const order = await orderService.getOrderDetails(orderId, userId);

        res.json(order);
    } catch (error) {
        console.error('Get order details error:', error);
        res.status(400).json({ message: error.message });
    }
}

// Get all orders for the authenticated user
async function getUserOrders(req, res) {
    try {
        const userId = req.user.userId;

        const orders = await orderService.getUserOrders(userId);

        res.json(orders);
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({ message: error.message });
    }
}

// Handle Stripe webhook events
async function handleStripeWebhook(req, res) {
    const sig = req.headers['stripe-signature'];

    try {
        // Verify webhook signature
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        // Process the event
        const result = await orderService.processStripeEvent(event);

        res.json({ received: true, type: event.type, result });
    } catch (error) {
        console.error('Webhook error:', error.message);
        return res.status(400).json({ message: `Webhook Error: ${error.message}` });
    }
}

module.exports = {
    createOrder,
    getOrderDetails,
    getUserOrders,
    handleStripeWebhook
}; 