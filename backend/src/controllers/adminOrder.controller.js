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
                                idUser: true,
                                idUserType: true,
                                email: true,
                                username: true,
                                status: true,
                                createdAt: true,
                                updatedAt: true,
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
                            include: { 
                                product: true,
                                userProductPersonalize: {
                                    include: {
                                        productPersonalization: {
                                            include: {
                                                personalization: true
                                            }
                                        }
                                    }
                                }
                            }
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

const getOrdersByProducts = async (req, res) => {
    try {
        const productIds = [].concat(req.query.product_id).map(id => parseInt(id));

        const orders = await prisma.order.findMany({
            include: {
                cart: {
                    include: {
                        user: {
                            select: {
                                idUser: true,
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
                            include: { 
                                product: true,
                                userProductPersonalize: {
                                    include: {
                                        productPersonalization: {
                                            include: {
                                                personalization: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                paymentType: true,
                shipmentType: true,
                orderStatus: true,
                location: true
            },
            orderBy: { createdAt: "desc" }
        });

        const filteredOrders = orders.filter(order => {
            const orderProductIds = order.cart.itemsCart.map(item => item.idProduct).sort();
            const targetIds = [...productIds].sort();

            return (
                orderProductIds.length === targetIds.length &&
                orderProductIds.every((id, i) => id === targetIds[i])
            );
        });

        const result = filteredOrders.map(order => {
            let locationFormatted = null;
            if (order.location) {
                locationFormatted = `${order.location.street}, ${order.location.houseNumber}\n${order.location.neighborhood}\n${order.location.postalCode}`;
            }

            return {
                ...order,
                locationFormatted
            };
        });

        return res.json(result);
    } catch (error) {
        console.error("Error al obtener órdenes exactas por productos:", error);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

/**
 * Get order details by ID (Admin only)
 * @param {Object} req - Express request object 
 * @param {Object} res - Express response object
 */
async function getOrderById(req, res) {
    try {
        const { id } = req.params;

        // Validate order ID
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                message: 'ID de orden inválido'
            });
        }

        // Query the order with all its details
        const order = await prisma.order.findUnique({
            where: { idOrder: parseInt(id) },
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
                            include: { 
                                product: true,
                                userProductPersonalize: {
                                    include: {
                                        productPersonalization: {
                                            include: {
                                                personalization: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                orderStatus: true,
                paymentType: true,
                shipmentType: true,
                location: true
            }
        });

        if (!order) {
            return res.status(404).json({
                message: 'Orden no encontrada'
            });
        }

        return res.status(200).json({
            message: 'Orden obtenida correctamente',
            data: order
        });

    } catch (error) {
        console.error('Error fetching order by ID:', error);
        return res.status(500).json({
            message: 'Error al obtener la orden',
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
        
        // Use the adminOrderNotification controller to handle the update
        // This way we ensure the notification is sent and use the same validation logic
        const adminOrderNotificationController = require('./adminOrderNotification.controller');
        
        // We need to adapt the request parameters to match the controller's expectations
        req.params.orderId = id;
        
        return adminOrderNotificationController.updateOrderStatus(req, res);
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
    getOrderById,
    updateOrderStatus,
    getOrdersByProducts
};
