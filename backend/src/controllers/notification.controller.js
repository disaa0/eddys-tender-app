const notificationService = require('../services/notification.service');

class NotificationController {
  /**
   * Register a push token for a user
   */
  async registerToken(req, res) {
    try {
      const { token, deviceInfo } = req.body;
      const userId = req.user.userId; // Get user ID from auth middleware (userId not idUser)

      if (!token) {
        return res.status(400).json({ message: 'Se requiere token' });
      }

      if (!userId) {
        return res.status(400).json({ message: 'Se requiere ID de usuario' });
      }

      await notificationService.registerToken(userId, token, deviceInfo);
      return res.status(200).json({ 
        message: 'Token registrado correctamente',
        success: true
      });
    } catch (error) {
      console.error('Error registering token:', error);
      return res.status(500).json({ 
        message: 'Error al registrar el token', 
        error: error.message 
      });
    }
  }
  
  /**
   * Unregister a push token for a user
   */
  async unregisterToken(req, res) {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: 'Se requiere token' });
      }
      
      await notificationService.unregisterToken(token);
      return res.status(200).json({ 
        message: 'Token eliminado correctamente',
        success: true 
      });
    } catch (error) {
      console.error('Error unregistering token:', error);
      return res.status(500).json({ 
        message: 'Error al eliminar el token', 
        error: error.message 
      });
    }
  }

  /**
   * Send a notification to a specific user
   */
  async sendNotification(req, res) {
    try {
      const { userId, title, body, data } = req.body;

      // Only admin can send notifications
      if (req.user.userType !== 1) { // Assuming 1 is admin
        return res.status(403).json({ message: 'Solo los administradores pueden enviar notificaciones' });
      }

      if (!userId || !title || !body) {
        return res.status(400).json({ message: 'Se requieren userId, título y mensaje' });
      }

      const result = await notificationService.sendNotificationToUser(userId, {
        title,
        body,
        data: data || {}
      });

      return res.status(200).json({ 
        message: 'Notificación enviada correctamente', 
        data: result,
        success: true 
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      return res.status(500).json({ 
        message: 'Error al enviar la notificación', 
        error: error.message 
      });
    }
  }

  /**
   * Send a notification to multiple users
   */
  async sendBulkNotifications(req, res) {
    try {
      const { userIds, title, body, data } = req.body;

      // Only admin can send notifications
      if (req.user.userType !== 1) { // Assuming 1 is admin
        return res.status(403).json({ message: 'Solo los administradores pueden enviar notificaciones' });
      }

      if (!userIds || !Array.isArray(userIds) || !title || !body) {
        return res.status(400).json({ message: 'Se requiere un array de userIds, título y mensaje' });
      }

      const result = await notificationService.sendNotificationsToUsers(userIds, {
        title,
        body,
        data: data || {}
      });

      return res.status(200).json({ 
        message: 'Notificaciones enviadas correctamente', 
        data: result,
        success: true 
      });
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      return res.status(500).json({ 
        message: 'Error al enviar las notificaciones', 
        error: error.message 
      });
    }
  }

  /**
   * Test endpoint to send a notification to the authenticated user
   */
  async testNotification(req, res) {
    try {
      const userId = req.user.userId;
      
      if (!userId) {
        return res.status(400).json({ message: 'Se requiere ID de usuario' });
      }
      
      const result = await notificationService.sendNotificationToUser(userId, {
        title: 'Notificación de Prueba',
        body: 'Esta es una notificación de prueba de Eddy\'s Tender App',
        data: { type: 'TEST_NOTIFICATION' }
      });
      
      res.status(200).json({ 
        message: 'Notificación de prueba enviada correctamente',
        data: result,
        success: true 
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      res.status(500).json({ 
        message: 'Error al enviar la notificación de prueba', 
        error: error.message 
      });
    }
  }
}

module.exports = new NotificationController();
