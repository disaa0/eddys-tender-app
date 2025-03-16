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

// Search orders with filters
async function searchOrders(req, res) {
    try {
        const userId = req.user.userId;
        const {
            startDate,
            endDate,
            orderStatus,
            paid,
            paymentType,
            shipmentType,
            minPrice,
            maxPrice,
            page,
            limit
        } = req.query;

        // Validate date formats if provided
        if (startDate && isNaN(Date.parse(startDate))) {
            return res.status(400).json({ message: 'Formato de fecha inicial inválido' });
        }
        if (endDate && isNaN(Date.parse(endDate))) {
            return res.status(400).json({ message: 'Formato de fecha final inválido' });
        }

        // Validate numeric filters
        if (orderStatus && isNaN(parseInt(orderStatus))) {
            return res.status(400).json({ message: 'Estado de orden inválido' });
        }
        if (paymentType && isNaN(parseInt(paymentType))) {
            return res.status(400).json({ message: 'Tipo de pago inválido' });
        }
        if (shipmentType && isNaN(parseInt(shipmentType))) {
            return res.status(400).json({ message: 'Tipo de envío inválido' });
        }

        // Validate price ranges
        if ((minPrice && isNaN(parseFloat(minPrice))) || (minPrice && parseFloat(minPrice) < 0)) {
            return res.status(400).json({ message: 'Precio mínimo inválido' });
        }
        if ((maxPrice && isNaN(parseFloat(maxPrice))) || (maxPrice && parseFloat(maxPrice) < 0)) {
            return res.status(400).json({ message: 'Precio máximo inválido' });
        }
        if (minPrice && maxPrice && parseFloat(maxPrice) < parseFloat(minPrice)) {
            return res.status(400).json({ message: 'El precio máximo debe ser mayor o igual al precio mínimo' });
        }

        // Validate pagination parameters
        if (page && (isNaN(parseInt(page)) || parseInt(page) < 1)) {
            return res.status(400).json({ message: 'Número de página inválido' });
        }
        if (limit && (isNaN(parseInt(limit)) || parseInt(limit) < 1)) {
            return res.status(400).json({ message: 'Límite de registros inválido' });
        }

        const result = await orderService.searchOrders(userId, {
            startDate,
            endDate,
            orderStatus,
            paid,
            paymentType,
            shipmentType,
            minPrice,
            maxPrice,
            page,
            limit
        });

        return res.status(200).json({
            message: "Pedidos encontrados",
            data: result
        });
    } catch (error) {
        console.error('Error searching orders:', error);
        return res.status(500).json({
            message: "Error al buscar pedidos",
            error: error.toString()
        });
    }
}

module.exports = {
    createOrder,
    getOrderDetails,
    getUserOrders,
    handleStripeWebhook,
    searchOrders
}; 
