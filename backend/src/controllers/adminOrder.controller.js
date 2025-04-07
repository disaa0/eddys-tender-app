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

module.exports = {
    getOrdersByDateRange
};
