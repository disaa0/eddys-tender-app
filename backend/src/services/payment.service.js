const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Create a payment intent with Stripe and associate with order
 * @param {number} orderId - The order ID to associate with payment
 * @param {number} amount - The amount in cents (e.g. $10.00 = 1000)
 * @param {string} currency - The currency code (default: 'mxn')
 * @returns {Object} - The payment intent details
 */
async function createPaymentIntent(orderId, amount, currency = 'mxn') {
    try {
        // Find order to ensure it exists
        const order = await prisma.order.findUnique({
            where: { idOrder: orderId }
        });

        if (!order) {
            throw new Error('Orden no encontrada');
        }

        if (order.paid) {
            throw new Error('Esta orden ya ha sido pagada');
        }

        // Create payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            metadata: {
                orderId: orderId.toString(),
            },
        });

        // Update order with Stripe payment intent details
        const updatedOrder = await prisma.order.update({
            where: { idOrder: orderId },
            data: {
                stripePaymentIntentId: paymentIntent.id,
                stripeClientSecret: paymentIntent.client_secret,
                stripePaymentStatus: paymentIntent.status,
            }
        });

        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            order: updatedOrder
        };
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw new Error(`Error al crear intención de pago: ${error.message}`);
    }
}

/**
 * Confirm payment success based on Stripe webhook
 * @param {string} paymentIntentId - The Stripe payment intent ID
 * @returns {Object} - Updated order details
 */
async function confirmPayment(paymentIntentId) {
    try {
        // Find order by payment intent ID
        const order = await prisma.order.findFirst({
            where: { stripePaymentIntentId: paymentIntentId }
        });

        if (!order) {
            throw new Error('Orden no encontrada para este pago');
        }

        // Update order as paid
        const updatedOrder = await prisma.order.update({
            where: { idOrder: order.idOrder },
            data: {
                paid: true,
                paidAt: new Date(),
                stripePaymentStatus: 'succeeded',
                idOrderStatus: 2 // Assuming 2 is 'Procesando'
            }
        });

        // Create notification for the order
        await prisma.notification.create({
            data: {
                idOrder: order.idOrder,
                title: '¡Pago recibido con éxito!',
                message: 'Tu pago ha sido procesado correctamente. Tu pedido está siendo preparado.',
                status: true
            }
        });

        return updatedOrder;
    } catch (error) {
        console.error('Error confirming payment:', error);
        throw new Error(`Error al confirmar pago: ${error.message}`);
    }
}

/**
 * Handle failed payments
 * @param {string} paymentIntentId - The Stripe payment intent ID
 * @returns {Object} - Updated order details
 */
async function handleFailedPayment(paymentIntentId) {
    try {
        const order = await prisma.order.findFirst({
            where: { stripePaymentIntentId: paymentIntentId }
        });

        if (!order) {
            throw new Error('Orden no encontrada para este pago');
        }

        // Update order with failed payment status
        const updatedOrder = await prisma.order.update({
            where: { idOrder: order.idOrder },
            data: {
                stripePaymentStatus: 'failed',
                idOrderStatus: 7 // Assuming 7 is 'Cancelado'
            }
        });

        // Create notification for the failed payment
        await prisma.notification.create({
            data: {
                idOrder: order.idOrder,
                title: 'Problema con tu pago',
                message: 'Hubo un problema al procesar tu pago. Por favor, intenta nuevamente.',
                status: true
            }
        });

        return updatedOrder;
    } catch (error) {
        console.error('Error handling failed payment:', error);
        throw new Error(`Error al manejar pago fallido: ${error.message}`);
    }
}

module.exports = {
    createPaymentIntent,
    confirmPayment,
    handleFailedPayment
}; 