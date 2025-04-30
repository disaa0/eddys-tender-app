const { Expo } = require('expo-server-sdk');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const expo = new Expo();

class NotificationService {
  /**
   * Register a user's push token
   * @param {number} userId - The user ID
   * @param {string} token - The Expo push token
   * @param {Object} deviceInfo - Information about the user's device
   * @returns {Promise}
   */
  async registerToken(userId, token, deviceInfo = {}) {
    // Validate the push token
    if (!Expo.isExpoPushToken(token)) {
      throw new Error(`Invalid Expo push token: ${token}`);
    }
    
    // Validate userId
    if (!userId) {
      throw new Error('User ID is required to register a notification token');
    }

    // Store token in database using upsert to avoid duplicates
    return prisma.notificationToken.upsert({
      where: {
        token: token
      },
      update: {
        idUser: userId,
        lastUsed: new Date(),
        deviceInfo
      },
      create: {
        token,
        deviceInfo,
        user: {
          connect: {
            idUser: userId
          }
        }
      }
    });
  }
  
  /**
   * Unregister a user's push token
   * @param {string} token - The Expo push token to unregister
   * @returns {Promise}
   */
  async unregisterToken(token) {
    // Validate the push token
    if (!Expo.isExpoPushToken(token)) {
      throw new Error(`Invalid Expo push token: ${token}`);
    }
    
    // Delete the token from the database
    return prisma.notificationToken.delete({
      where: {
        token: token
      }
    }).catch(error => {
      // If token doesn't exist, that's fine - just log and continue
      if (error.code === 'P2025') { // Prisma "Record not found" error
        console.log(`Token ${token} not found for deletion`);
        return { message: 'Token not found' };
      }
      throw error;
    });
  }

  /**
   * Send notifications to multiple users
   * @param {Array<number>} userIds - Array of user IDs to notify
   * @param {Object} message - The notification message object
   * @returns {Promise} Result of the send operation
   */
  async sendNotificationsToUsers(userIds, message) {
    // Get tokens for the specified users
    const tokens = await prisma.notificationToken.findMany({
      where: {
        idUser: {
          in: userIds
        }
      },
      select: {
        token: true
      }
    });
    
    const pushTokens = tokens.map(t => t.token);
    return this.sendNotifications(pushTokens, message);
  }

  /**
   * Send notification to a single user
   * @param {number} userId - The user ID to notify
   * @param {Object} message - The notification message object
   * @returns {Promise} Result of the send operation
   */
  async sendNotificationToUser(userId, message) {
    return this.sendNotificationsToUsers([userId], message);
  }

  /**
   * Send notifications to specific tokens
   * @param {Array<string>} pushTokens - Array of Expo push tokens
   * @param {Object} message - Notification content
   * @returns {Promise} Result of the send operation
   */
  async sendNotifications(pushTokens, message) {
    // Filter for valid tokens
    const validPushTokens = pushTokens.filter(token => Expo.isExpoPushToken(token));

    if (validPushTokens.length === 0) {
      console.log('No valid push tokens to send to');
      return { success: false, message: 'No valid push tokens found' };
    }

    // Create the messages to send
    const messages = validPushTokens.map(token => ({
      to: token,
      sound: 'default',
      priority: 'high',
      ...message,
      // Make sure data is an object
      data: message.data || {}
    }));

    // Chunk the messages to ensure they don't exceed Expo's limit
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    try {
      // Send the chunks to the Expo push notification service
      for (const chunk of chunks) {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      }

      // Check for any errors in the tickets
      const receiptIds = [];
      for (let ticket of tickets) {
        if (ticket.id) {
          receiptIds.push(ticket.id);
        }
      }

      // If there are receiptIds, check their status
      if (receiptIds.length > 0) {
        // Wait 5 seconds before checking receipts
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const receipts = await this.checkNotificationReceipts(receiptIds);
        
        // Log receipt status for debugging
        for (const id in receipts) {
          const receipt = receipts[id];
          if (receipt.status === 'error') {
            console.error(`Error sending notification: ${receipt.message}`);
          }
        }
      }

      return { success: true, tickets };
    } catch (error) {
      console.error('Error sending push notifications:', error);
      throw error;
    }
  }

  /**
   * Check the status of delivered notifications
   * @param {Array<string>} receiptIds - Array of receipt IDs
   * @returns {Promise} Status of the receipts
   */
  async checkNotificationReceipts(receiptIds) {
    const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
    const receipts = {};
    
    for (const chunk of receiptIdChunks) {
      try {
        const receiptChunk = await expo.getPushNotificationReceiptsAsync(chunk);
        Object.assign(receipts, receiptChunk);
      } catch (error) {
        console.error('Error getting receipts:', error);
      }
    }

    return receipts;
  }

  /**
   * Send notification about order status update
   * @param {number} orderId - The order ID
   * @param {string} status - The new status
   * @returns {Promise} Result of the send operation
   */
  async sendOrderStatusNotification(orderId, status) {
    try {
      // Get order with user info
      const order = await prisma.order.findUnique({
        where: { idOrder: orderId },
        include: {
          cart: {
            include: {
              user: true
            }
          },
          orderStatus: true
        }
      });

      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      const userId = order.cart.user.idUser;
      const statusName = order.orderStatus.status;
      
      // Create notification in database
      await prisma.notification.create({
        data: {
          idOrder: orderId,
          title: `Pedido #${orderId} ${statusName}`,
          message: `Tu pedido #${orderId} ahora está ${statusName}`,
          status: true
        }
      });

      // Send push notification
      return this.sendNotificationToUser(userId, {
        title: `Pedido #${orderId} ${statusName}`,
        body: `Tu pedido #${orderId} ahora está ${statusName}`,
        data: {
          type: 'ORDER_STATUS',
          orderId,
          status
        }
      });
    } catch (error) {
      console.error('Error sending order status notification:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
