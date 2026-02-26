const { sendNotificationToToken, sendNotificationToTokens } = require('../utils/firebase');
const { Customer, Restaurant, DeliveryMan, Order } = require('../../models');

/**
 * Notification Service
 * Handles all notification logic for the application
 */

class NotificationService {
  /**
   * Notify customer about order status change
   */
  static async notifyCustomerOrderStatus(customerId, orderId, status, message) {
    try {
      const customer = await Customer.findByPk(customerId);
      
      if (!customer || !customer.fcmToken) {
        console.log(`Customer ${customerId} does not have FCM token`);
        return null;
      }

      return await sendNotificationToToken({
        token: customer.fcmToken,
        title: 'Order Update',
        body: message || `Your order #${orderId} status: ${status}`,
        data: {
          type: 'order_update',
          orderId: orderId.toString(),
          status: status,
          customerId: customerId.toString()
        }
      });
    } catch (error) {
      console.error('Error notifying customer:', error);
      throw error;
    }
  }

  /**
   * Notify restaurant about new order
   */
  static async notifyRestaurantNewOrder(restaurantId, orderId, orderDetails) {
    try {
      const restaurant = await Restaurant.findByPk(restaurantId);
      
      if (!restaurant || !restaurant.fcmToken) {
        console.log(`Restaurant ${restaurantId} does not have FCM token`);
        return null;
      }

      return await sendNotificationToToken({
        token: restaurant.fcmToken,
        title: 'New Order Received!',
        body: `Order #${orderId} - ${orderDetails.itemCount} items - $${orderDetails.total}`,
        data: {
          type: 'new_order',
          orderId: orderId.toString(),
          restaurantId: restaurantId.toString(),
          total: orderDetails.total.toString(),
          itemCount: orderDetails.itemCount.toString()
        },
        options: {
          priority: 'high',
          sound: 'notification_sound.mp3'
        }
      });
    } catch (error) {
      console.error('Error notifying restaurant:', error);
      throw error;
    }
  }

  /**
   * Notify all available delivery men about new delivery opportunity
   */
  static async notifyAvailableDeliveryMen(orderId, orderDetails) {
    try {
      const deliveryMen = await DeliveryMan.findAll({
        where: {
          isActive: true,
          status: 'active'
        }
      });

      const tokens = deliveryMen
        .map(dm => dm.fcmToken)
        .filter(token => token !== null && token !== undefined);

      if (tokens.length === 0) {
        console.log('No delivery men with FCM tokens available');
        return null;
      }

      return await sendNotificationToTokens({
        tokens: tokens,
        title: 'New Delivery Available',
        body: `Order #${orderId} - Delivery fee: $${orderDetails.deliveryFee}`,
        data: {
          type: 'new_delivery',
          orderId: orderId.toString(),
          restaurantId: orderDetails.restaurantId.toString(),
          deliveryFee: orderDetails.deliveryFee.toString(),
          distance: orderDetails.distance?.toString() || '0'
        },
        options: {
          priority: 'high'
        }
      });
    } catch (error) {
      console.error('Error notifying delivery men:', error);
      throw error;
    }
  }

  /**
   * Notify specific delivery man about order assignment
   */
  static async notifyDeliveryManAssignment(deliveryManId, orderId, orderDetails) {
    try {
      const deliveryMan = await DeliveryMan.findByPk(deliveryManId);
      
      if (!deliveryMan || !deliveryMan.fcmToken) {
        console.log(`Delivery man ${deliveryManId} does not have FCM token`);
        return null;
      }

      return await sendNotificationToToken({
        token: deliveryMan.fcmToken,
        title: 'Order Assigned to You',
        body: `Pickup from ${orderDetails.restaurantName} - Deliver to ${orderDetails.customerAddress}`,
        data: {
          type: 'order_assigned',
          orderId: orderId.toString(),
          deliveryManId: deliveryManId.toString(),
          restaurantId: orderDetails.restaurantId.toString(),
          deliveryFee: orderDetails.deliveryFee.toString()
        },
        options: {
          priority: 'high',
          sound: 'default'
        }
      });
    } catch (error) {
      console.error('Error notifying delivery man:', error);
      throw error;
    }
  }

  /**
   * Send promotional notification to all customers
   */
  static async sendPromotionToAllCustomers(title, message, promotionData = {}) {
    try {
      const customers = await Customer.findAll({
        where: {
          isActive: true
        }
      });

      const tokens = customers
        .map(c => c.fcmToken)
        .filter(token => token !== null && token !== undefined);

      if (tokens.length === 0) {
        console.log('No customers with FCM tokens');
        return null;
      }

      return await sendNotificationToTokens({
        tokens: tokens,
        title: title,
        body: message,
        data: {
          type: 'promotion',
          ...promotionData
        },
        options: {
          priority: 'normal'
        }
      });
    } catch (error) {
      console.error('Error sending promotion:', error);
      throw error;
    }
  }

  /**
   * Comprehensive order status notification
   * Notifies all relevant parties based on order status
   */
  static async notifyOrderStatusChange(orderId, newStatus) {
    try {
      const order = await Order.findByPk(orderId, {
        include: [
          { model: Customer, as: 'customer' },
          { model: Restaurant, as: 'restaurant' },
          { model: DeliveryMan, as: 'deliveryMan' }
        ]
      });

      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      const notifications = [];

      // Define messages for each status
      const statusMessages = {
        confirmed: {
          customer: 'Your order has been confirmed by the restaurant',
          restaurant: `Order #${orderId} confirmed and being prepared`,
          deliveryMan: null
        },
        preparing: {
          customer: 'Your order is being prepared',
          restaurant: `Preparing order #${orderId}`,
          deliveryMan: null
        },
        ready: {
          customer: 'Your order is ready and waiting for pickup',
          restaurant: `Order #${orderId} is ready for delivery`,
          deliveryMan: `Order #${orderId} is ready for pickup`
        },
        out_for_delivery: {
          customer: 'Your order is on the way!',
          restaurant: `Order #${orderId} is out for delivery`,
          deliveryMan: `Delivering order #${orderId}`
        },
        delivered: {
          customer: 'Your order has been delivered. Enjoy your meal!',
          restaurant: `Order #${orderId} delivered successfully`,
          deliveryMan: `Order #${orderId} delivered successfully`
        },
        cancelled: {
          customer: 'Your order has been cancelled',
          restaurant: `Order #${orderId} was cancelled`,
          deliveryMan: `Order #${orderId} was cancelled`
        }
      };

      const messages = statusMessages[newStatus];
      if (!messages) {
        console.log(`No notification messages defined for status: ${newStatus}`);
        return null;
      }

      // Notify customer
      if (order.customer?.fcmToken && messages.customer) {
        const result = await sendNotificationToToken({
          token: order.customer.fcmToken,
          title: 'Order Update',
          body: messages.customer,
          data: {
            type: 'order_status',
            orderId: orderId.toString(),
            status: newStatus,
            customerId: order.customerId.toString()
          }
        });
        notifications.push({ role: 'customer', result });
      }

      // Notify restaurant
      if (order.restaurant?.fcmToken && messages.restaurant) {
        const result = await sendNotificationToToken({
          token: order.restaurant.fcmToken,
          title: 'Order Status Update',
          body: messages.restaurant,
          data: {
            type: 'order_status',
            orderId: orderId.toString(),
            status: newStatus,
            restaurantId: order.restaurantId.toString()
          }
        });
        notifications.push({ role: 'restaurant', result });
      }

      // Notify delivery man
      if (order.deliveryMan?.fcmToken && messages.deliveryMan) {
        const result = await sendNotificationToToken({
          token: order.deliveryMan.fcmToken,
          title: 'Delivery Update',
          body: messages.deliveryMan,
          data: {
            type: 'delivery_status',
            orderId: orderId.toString(),
            status: newStatus,
            deliveryManId: order.deliveryManId.toString()
          }
        });
        notifications.push({ role: 'deliveryMan', result });
      }

      console.log(`Sent ${notifications.length} notifications for order ${orderId} status: ${newStatus}`);
      return notifications;
    } catch (error) {
      console.error('Error in notifyOrderStatusChange:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
