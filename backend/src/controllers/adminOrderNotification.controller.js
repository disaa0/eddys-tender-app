const prisma = require('../lib/prisma');
const notificationService = require('../services/notification.service');

class AdminOrderNotificationController {
  /**
   * Get all admin notification tokens
   */
  async getAdminTokens(req, res) {
    try {
      // Only admin can access this endpoint
      if (req.user.userType !== 1) {
        return res.status(403).json({ message: 'Acceso denegado' });
      }
      
      const adminUsers = await prisma.user.findMany({
        where: {
          idUserType: 1,
          status: true
        },
        select: {
          idUser: true,
          username: true,
          notificationTokens: {
            select: {
              token: true,
              deviceInfo: true,
              lastUsed: true
            }
          }
        }
      });
      
      return res.status(200).json({
        message: 'Tokens de administradores obtenidos correctamente',
        data: adminUsers,
        success: true
      });
    } catch (error) {
      console.error('Error getting admin tokens:', error);
      return res.status(500).json({
        message: 'Error al obtener tokens de administradores',
        error: error.message
      });
    }
  }
  
  /**
   * Send test notification to all admins
   */
  async testAdminNotification(req, res) {
    try {
      // Only admin can use this endpoint
      if (req.user.userType !== 1) {
        return res.status(403).json({ message: 'Acceso denegado' });
      }
      
      const result = await notificationService.sendNotificationsToAdmins({
        title: 'Prueba de Notificación Administrativa',
        body: 'Esta es una prueba de notificaciones para administradores',
        data: {
          type: 'ADMIN_TEST',
          timestamp: new Date().toISOString()
        }
      });
      
      return res.status(200).json({
        message: 'Notificación de prueba enviada a administradores',
        data: result,
        success: true
      });
    } catch (error) {
      console.error('Error sending test admin notification:', error);
      return res.status(500).json({
        message: 'Error al enviar notificación de prueba a administradores',
        error: error.message
      });
    }
  }
  /**
   * Update order status and send notification
   */
  async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { idOrderStatus } = req.body;

      if (!orderId || !idOrderStatus) {
        return res.status(400).json({ message: 'Se requieren ID de orden y estado' });
      }

      // Validate order ID
      if (isNaN(parseInt(orderId))) {
        return res.status(400).json({ message: 'ID de orden inválido' });
      }

      // Validate order status ID
      if (isNaN(parseInt(idOrderStatus))) {
        return res.status(400).json({ message: 'Se requiere un ID de estado de orden válido' });
      }

      // Check if order exists
      const orderExists = await prisma.order.findUnique({
        where: { idOrder: parseInt(orderId) }
      });

      if (!orderExists) {
        return res.status(404).json({ message: 'Orden no encontrada' });
      }

      // Check if the order status exists
      const statusExists = await prisma.orderStatus.findUnique({
        where: { idOrderStatus: parseInt(idOrderStatus) }
      });

      if (!statusExists) {
        return res.status(404).json({ message: 'Estado de orden no encontrado' });
      }

      // Update order status
      const updatedOrder = await prisma.order.update({
        where: { idOrder: parseInt(orderId) },
        data: { idOrderStatus: parseInt(idOrderStatus) },
        include: {
          orderStatus: true,
          cart: {
            include: {
              user: true
            }
          },
          paymentType: true,
          shipmentType: true
        }
      });

      // If the order status changed to "Delivered" (assuming idOrderStatus 5 is for delivered)
      if (parseInt(idOrderStatus) === 5) {  // Replace with your actual "Delivered" status ID
        await prisma.order.update({
          where: { idOrder: parseInt(orderId) },
          data: { deliveryAt: new Date() }
        });
      }

      // Send notification to user
      await notificationService.sendOrderStatusNotification(
        parseInt(orderId), 
        updatedOrder.orderStatus.status
      );

      return res.status(200).json({
        message: 'Estado de orden actualizado y notificación enviada',
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

  /**
   * Get all notifications for an order
   */
  async getOrderNotifications(req, res) {
    try {
      const { orderId } = req.params;

      if (!orderId || isNaN(parseInt(orderId))) {
        return res.status(400).json({ message: 'ID de orden inválido' });
      }

      const notifications = await prisma.notification.findMany({
        where: { idOrder: parseInt(orderId) },
        orderBy: { createdAt: 'desc' }
      });

      return res.status(200).json({
        message: 'Notificaciones obtenidas correctamente',
        data: notifications
      });
    } catch (error) {
      console.error('Error fetching order notifications:', error);
      return res.status(500).json({ 
        message: 'Error al obtener las notificaciones', 
        error: error.message 
      });
    }
  }

  /**
   * Send custom notification about an order
   */
  async sendCustomOrderNotification(req, res) {
    try {
      const { orderId } = req.params;
      const { title, message } = req.body;

      if (!title || !message) {
        return res.status(400).json({ message: 'Se requieren título y mensaje' });
      }

      // Get order with user info
      const order = await prisma.order.findUnique({
        where: { idOrder: parseInt(orderId) },
        include: {
          cart: {
            include: {
              user: true
            }
          }
        }
      });

      if (!order) {
        return res.status(404).json({ message: 'Orden no encontrada' });
      }

      // Create notification in database
      const notification = await prisma.notification.create({
        data: {
          idOrder: parseInt(orderId),
          title,
          message,
          status: true
        }
      });

      // Send push notification
      await notificationService.sendNotificationToUser(order.cart.user.idUser, {
        title,
        body: message,
        data: {
          type: 'ORDER_NOTIFICATION',
          orderId: parseInt(orderId)
        }
      });

      return res.status(200).json({
        message: 'Notificación personalizada enviada',
        data: notification
      });
    } catch (error) {
      console.error('Error sending custom notification:', error);
      return res.status(500).json({ message: 'Error al enviar la notificación', error: error.message });
    }
  }
}

module.exports = new AdminOrderNotificationController();
