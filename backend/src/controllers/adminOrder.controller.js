const prisma = require('../lib/prisma');

/**
 * Get orders within a date range (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getOrdersByDateRange(req, res) {
    try {
        const { date_from, date_to } = req.query;
        
        // Validate date parameters
        if (!date_from || !date_to) {
            return res.status(400).json({ 
                message: 'Se requieren los parámetros date_from y date_to' 
            });
        }
        
        // Parse and validate dates
        const fromDate = new Date(date_from);
        const toDate = new Date(date_to);
        
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            return res.status(400).json({ 
                message: 'Formato de fecha inválido. Use YYYY-MM-DD' 
            });
        }
        
        // Set toDate to end of day (23:59:59)
        toDate.setHours(23, 59, 59, 999);
        
        // Query orders within date range
        const orders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: fromDate,
                    lte: toDate
                }
            },
            include: {
                cart: {
                    include: {
                        user: {
                            select: {
                                email: true,
                                username: true,
                                userInformation: {
                                    select: {
                                        name: true,
                                        lastName: true,
                                        secondLastName: true,
                                        phone: true
                                    }
                                }
                            }
                        },
                        itemsCart: {
                            where: { status: true },
                            include: { product: true }
                        }
                    }
                },
                orderStatus: true,
                paymentType: true,
                shipmentType: true,
                location: true
            },
            orderBy: { createdAt: 'desc' }
        });
        
        return res.status(200).json({
            message: 'Órdenes obtenidas correctamente',
            data: { orders, count: orders.length }
        });
        
    } catch (error) {
        console.error('Error fetching orders by date range:', error);
        return res.status(500).json({
            message: 'Error al obtener órdenes por rango de fecha',
            error: error.message
        });
    }
}

/**
 * Change the status of an order (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateOrderStatus(req, res) {
    try {
        const { id } = req.params;
        const { idOrderStatus } = req.body;

        // Validate order ID
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                message: 'ID de orden inválido'
            });
        }

        // Validate order status ID
        if (!idOrderStatus || isNaN(parseInt(idOrderStatus))) {
            return res.status(400).json({
                message: 'Se requiere un ID de estado de orden válido'
            });
        }

        // Check if the order exists
        const orderExists = await prisma.order.findUnique({
            where: { idOrder: parseInt(id) }
        });

        if (!orderExists) {
            return res.status(404).json({
                message: 'Orden no encontrada'
            });
        }

        // Check if the order status exists
        const statusExists = await prisma.orderStatus.findUnique({
            where: { idOrderStatus: parseInt(idOrderStatus) }
        });

        if (!statusExists) {
            return res.status(404).json({
                message: 'Estado de orden no encontrado'
            });
        }

        // Update the order status
        const updatedOrder = await prisma.order.update({
            where: { idOrder: parseInt(id) },
            data: { idOrderStatus: parseInt(idOrderStatus) },
            include: {
                orderStatus: true,
                paymentType: true,
                shipmentType: true
            }
        });

        // If the order status changed to "Delivered" (assuming idOrderStatus 5 is for delivered)
        if (parseInt(idOrderStatus) === 5) {  // Replace with your actual "Delivered" status ID
            updatedOrder.deliveryAt = new Date();
            
            await prisma.order.update({
                where: { idOrder: parseInt(id) },
                data: { deliveryAt: updatedOrder.deliveryAt }
            });
        }

        return res.status(200).json({
            message: 'Estado de orden actualizado correctamente',
            data: updatedOrder
        });

    } catch (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({
            message: 'Error al actualizar el estado de la orden',
            error: error.message
        });
    }
}

module.exports = {
    getOrdersByDateRange,
    updateOrderStatus
};
