const notificationService = require('../services/notification.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
}

module.exports = new AdminOrderNotificationController();
