const { PayMobOrder, PayMobTransaction, Order, Customer, Restaurant } = require('../../models');
const paymobService = require('../services/paymob');
const { Op } = require('sequelize');

const initiatePayment = async (req, res) => {
  try {
    const { amount, order_reference, billingData } = req.body;
    const customerId = req.user.id;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Valid amount (number > 0) is required' 
      });
    }

    if (!billingData || typeof billingData !== 'object') {
      return res.status(400).json({ 
        success: false,
        message: 'Billing data is required' 
      });
    }

    const requiredBillingFields = ['email', 'first_name', 'phone_number'];
    const missingFields = requiredBillingFields.filter(field => !billingData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Missing required billing fields: ${missingFields.join(', ')}` 
      });
    }

    let orderId = null;
    if (order_reference) {
      const order = await Order.findOne({
        where: { 
          id: order_reference,
          customerId: customerId
        }
      });

      if (!order) {
        return res.status(404).json({ 
          success: false,
          message: 'Order not found or does not belong to you' 
        });
      }
      orderId = order.id;
    }

    const amountCents = Math.round(amount * 100);

    const paymobOrderResponse = await paymobService.registerOrder({
      amount_cents: amountCents,
      currency: 'EGP',
      merchant_order_id: orderId
    });

    const paymentKey = await paymobService.generatePaymentKey({
      order_id: paymobOrderResponse.id,
      amount_cents: amountCents,
      billing_data: billingData,
      currency: 'EGP'
    });

    const paymobOrder = await PayMobOrder.create({
      orderId: orderId,
      customerId: customerId,
      paymobOrderId: paymobOrderResponse.id.toString(),
      amount: amount,
      amountCents: amountCents,
      currency: 'EGP',
      paymentKey: paymentKey,
      billingData: billingData,
      status: 'pending',
      createdBy: `customer:${customerId}`
    });

    const iframeUrl = paymobService.getIframeUrl(paymentKey);

    res.status(201).json({
      success: true,
      message: 'Payment initiated successfully',
      data: {
        iframe_url: iframeUrl,
        payment_id: paymobOrder.id,
        paymob_order_id: paymobOrder.paymobOrderId,
        amount: paymobOrder.amount,
        currency: paymobOrder.currency,
        status: paymobOrder.status
      }
    });
  } catch (error) {
    console.error('Payment initiation error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

 const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'EGP', orderId, billingData } = req.body;
    const customerId = req.user.id;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    if (!billingData || !billingData.email || !billingData.first_name || !billingData.phone_number) {
      return res.status(400).json({
        success: false,
        message: 'Billing data with email, first_name, and phone_number is required'
      });
    }

    if (orderId) {
      const order = await Order.findOne({
        where: {
          id: orderId,
          customerId: customerId
        }
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found or does not belong to you'
        });
      }
    }

    const amountCents = Math.round(amount * 100);

    const paymobOrderResponse = await paymobService.registerOrder({
      amount_cents: amountCents,
      currency: currency,
      merchant_order_id: order_reference
    });

    const paymentKey = await paymobService.generatePaymentKey({
      order_id: paymobOrderResponse.id,
      amount_cents: amountCents,
      billing_data: billingData,
      currency: currency
    });

    const paymobOrder = await PayMobOrder.create({
      orderId: orderId || null,
      customerId: customerId,
      paymobOrderId: paymobOrderResponse.id.toString(),
      amount: amount,
      amountCents: amountCents,
      currency: currency,
      paymentKey: paymentKey,
      billingData: billingData,
      status: 'pending',
      createdBy: `customer:${customerId}`
    });

    const iframeUrl = paymobService.getIframeUrl(paymentKey);

    res.status(201).json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        id: paymobOrder.id,
        paymobOrderId: paymobOrder.paymobOrderId,
        orderId: paymobOrder.orderId,
        amount: paymobOrder.amount,
        currency: paymobOrder.currency,
        paymentKey: paymentKey,
        iframeUrl: iframeUrl,
        status: paymobOrder.status
      }
    });
  } catch (error) {
    console.error('Create PayMob order error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
 };

/**
 * Get payment status by transaction ID
 * GET /api/paymob/payment-status/:transactionId
 */
const getPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json({ 
        success: false,
        message: 'Transaction ID is required' 
      });
    }

    // Check if transaction exists in database
    let transaction = await PayMobTransaction.findOne({
      where: { transactionId: transactionId },
      include: [{
        model: PayMobOrder,
        as: 'paymobOrder',
        attributes: ['id', 'orderId', 'amount', 'currency', 'status']
      }]
    });

    // If not in database, verify with PayMob API
    if (!transaction) {
      let paymobResponse;
      try {
        paymobResponse = await paymobService.verifyTransaction(transactionId);
      } catch (e) {
        if (e && (e.code === 'PAYMOB_TRANSACTION_NOT_FOUND' || e.status === 404)) {
          return res.status(404).json({
            success: false,
            message: 'Transaction not found'
          });
        }
        throw e;
      }
      
      res.status(200).json({
        success: true,
        message: 'Transaction status retrieved from PayMob',
        data: {
          transactionId: transactionId,
          status: paymobResponse.success ? 'success' : 'failed',
          amount: paymobResponse.amount_cents / 100,
          currency: paymobResponse.currency,
          isPending: paymobResponse.pending,
          paymentMethod: paymobResponse.source_data?.type || null,
          paymobData: paymobResponse
        }
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'Transaction status retrieved from database',
        data: {
          id: transaction.id,
          transactionId: transaction.transactionId,
          paymobOrderId: transaction.paymobOrderId,
          orderId: transaction.paymobOrder?.orderId,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status,
          paymentMethod: transaction.paymentMethod,
          verifiedAt: transaction.verifiedAt
        }
      });
    }
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message
    });
  }
};

/**
 * Verify a payment transaction
 * POST /api/paymob/verify/:transactionId
 */
const verifyPayment = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const customerId = req.user.id;

    if (!transactionId) {
      return res.status(400).json({ 
        success: false,
        message: 'Transaction ID is required' 
      });
    }

    // Verify with PayMob
    const paymobResponse = await paymobService.verifyTransaction(transactionId);

    // Find or create PayMob order
    let paymobOrder = await PayMobOrder.findOne({
      where: { paymobOrderId: paymobResponse.order.id.toString() }
    });

    if (!paymobOrder) {
      // Create if not exists
      paymobOrder = await PayMobOrder.create({
        orderId: null,
        customerId: customerId,
        paymobOrderId: paymobResponse.order.id.toString(),
        amount: paymobResponse.amount_cents / 100,
        amountCents: paymobResponse.amount_cents,
        currency: paymobResponse.currency,
        status: paymobResponse.success ? 'completed' : 'failed',
        paymentStatus: paymobResponse.success ? 'paid' : 'failed',
        createdBy: `customer:${customerId}`
      });
    } else {
      // Update status
      await paymobOrder.update({
        status: paymobResponse.success ? 'completed' : 'failed',
        paymentStatus: paymobResponse.success ? 'paid' : 'failed',
        updatedBy: `customer:${customerId}`
      });
    }

    // Create or update transaction record
    let transaction = await PayMobTransaction.findOne({
      where: { transactionId: transactionId }
    });

    if (!transaction) {
      transaction = await PayMobTransaction.create({
        paymobOrderId: paymobOrder.id,
        transactionId: transactionId,
        amount: paymobResponse.amount_cents / 100,
        amountCents: paymobResponse.amount_cents,
        currency: paymobResponse.currency,
        status: paymobResponse.success ? 'success' : 'failed',
        paymentMethod: paymobResponse.source_data?.type || null,
        responseData: paymobResponse,
        verifiedAt: new Date(),
        createdBy: `customer:${customerId}`
      });
    } else {
      await transaction.update({
        status: paymobResponse.success ? 'success' : 'failed',
        responseData: paymobResponse,
        verifiedAt: new Date(),
        updatedBy: `customer:${customerId}`
      });
    }

    // If linked to an order, update order payment status
    if (paymobOrder.orderId) {
      await Order.update({
        paymentStatus: paymobResponse.success ? 'paid' : 'failed',
        paymentMethod: 'paymob',
        updatedBy: `customer:${customerId}`
      }, {
        where: { id: paymobOrder.orderId }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        transactionId: transaction.transactionId,
        paymobOrderId: paymobOrder.paymobOrderId,
        orderId: paymobOrder.orderId,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        paymentMethod: transaction.paymentMethod,
        isPaid: paymobResponse.success,
        verifiedAt: transaction.verifiedAt
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
};

const handleWebhook = async (req, res) => {
  try {
    const bodyData = req.body && Object.keys(req.body).length ? req.body : null;
    const queryData = req.query && Object.keys(req.query).length ? req.query : null;

    const webhookData = bodyData || queryData;
    const hmac = (req.query && req.query.hmac) || (bodyData && bodyData.hmac);

    if (!webhookData || !webhookData.id) {
      return res.status(200).json({ success: true });
    }

    const normalizedData = bodyData
      ? webhookData
      : {
          id: webhookData.id,
          pending: webhookData.pending === 'true' || webhookData.pending === true,
          amount_cents: webhookData.amount_cents ? parseInt(webhookData.amount_cents, 10) : undefined,
          success: webhookData.success === 'true' || webhookData.success === true,
          is_auth: webhookData.is_auth === 'true' || webhookData.is_auth === true,
          is_capture: webhookData.is_capture === 'true' || webhookData.is_capture === true,
          is_standalone_payment:
            webhookData.is_standalone_payment === 'true' || webhookData.is_standalone_payment === true,
          is_voided: webhookData.is_voided === 'true' || webhookData.is_voided === true,
          is_refunded: webhookData.is_refunded === 'true' || webhookData.is_refunded === true,
          is_3d_secure: webhookData.is_3d_secure === 'true' || webhookData.is_3d_secure === true,
          integration_id: webhookData.integration_id ? parseInt(webhookData.integration_id, 10) : undefined,
          has_parent_transaction:
            webhookData.has_parent_transaction === 'true' || webhookData.has_parent_transaction === true,
          order: webhookData.order,
          created_at: webhookData.created_at,
          currency: webhookData.currency,
          error_occured: webhookData.error_occured === 'true' || webhookData.error_occured === true,
          owner: webhookData.owner,
          source_data: {
            type: webhookData['source_data.type'],
            pan: webhookData['source_data.pan'],
            sub_type: webhookData['source_data.sub_type']
          }
        };

    // TEMPORARY: HMAC verification disabled.
    // Re-enable by uncommenting this block once PAYMOB_HMAC_SECRET is verified.
    //
    // if (!hmac) {
    //   console.error('Webhook rejected: missing HMAC signature');
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Missing HMAC signature'
    //   });
    // }
    //
    // const isValid = paymobService.verifyWebhookSignature(normalizedData, hmac);
    // if (!isValid) {
    //   console.error('Webhook rejected: invalid HMAC signature');
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Invalid signature'
    //   });
    // }

    const transactionId = normalizedData.id.toString();
    const paymobOrderId = (normalizedData.order?.id || normalizedData.order || '').toString();
    console.log('transactionId', transactionId);
    console.log('paymobOrderId', paymobOrderId);
    const existingTransaction = await PayMobTransaction.findOne({
      where: { transactionId: transactionId }
    });
    console.log('existingTransaction', existingTransaction);
    if (existingTransaction) {
      console.log('Duplicate webhook ignored:', transactionId);
      return res.status(200).json({ success: true });
    }

    const paymobOrder = await PayMobOrder.findOne({
      where: { paymobOrderId: paymobOrderId },
      include: [{
        model: Order,
        as: 'order'
      }]
    });
    console.log('paymobOrder', paymobOrder);
    if (!paymobOrder) {
      console.error('PayMob order not found for webhook:', paymobOrderId);
      return res.status(200).json({ success: true });
    }

    const isSuccess = normalizedData.success === true || normalizedData.success === 'true';
    const newStatus = isSuccess ? 'completed' : 'failed';
    const paymentStatus = isSuccess ? 'paid' : 'failed';
    console.log('newStatus', newStatus);
    console.log('paymentStatus', paymentStatus);
    await paymobOrder.update({
      status: newStatus,
      paymentStatus: paymentStatus,
      updatedBy: 'paymob:webhook'
    });

    await PayMobTransaction.create({
      paymobOrderId: paymobOrder.id,
      transactionId: transactionId,
      amount: normalizedData.amount_cents / 100,
      amountCents: normalizedData.amount_cents,
      currency: normalizedData.currency || 'EGP',
      status: isSuccess ? 'success' : 'failed',
      paymentMethod: normalizedData.source_data?.type || normalizedData.source_data?.sub_type || null,
      webhookData: webhookData,
      verifiedAt: new Date(),
      createdBy: 'paymob:webhook'
    });

    if (paymobOrder.orderId && isSuccess) {
      const order = await Order.findOne({
        where: { id: paymobOrder.orderId },
        include: [{
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'fcmToken']
        }]
      });

      if (!order) {
        console.warn(`Order ${paymobOrder.orderId} not found while processing Paymob webhook`);
      } else {
        const orderUpdates = {
          paymentStatus: 'paid',
          paymentMethod: 'digital',
          status: 'pending',
          deliveryStatus: order.deliveryStatus === 'awaiting_payment' ? 'pending' : order.deliveryStatus,
          updatedBy: 'paymob:webhook'
        };

        await Order.update(orderUpdates, {
          where: { id: paymobOrder.orderId }
        });

        // Ensure in-memory instance reflects database updates for subsequent logic/logs
        Object.assign(order, orderUpdates);

        // Send notification to restaurant now that payment is confirmed
        if (order.restaurant && order.restaurant.fcmToken) {
          try {
            const { sendNotificationToToken } = require('../utils/firebase');
            await sendNotificationToToken({
              token: order.restaurant.fcmToken,
              title: 'طلب جديد مدفوع',
              body: `لديك طلب جديد مدفوع في الانتظار - رقم الطلب: ${order.orderNumber}`,
              data: {
                screen: 'restaurantOrderScreen',
                orderId: order.id.toString()
              }
            });
            console.log(`Notification sent to restaurant ${order.restaurant.id} for paid order ${order.id}`);
          } catch (notificationError) {
            console.error('Failed to send notification to restaurant:', notificationError);
            
            if (notificationError.code === 'messaging/invalid-registration-token' ||
                notificationError.code === 'messaging/registration-token-not-registered') {
              await order.restaurant.update({ fcmToken: null });
              console.log(`Cleared invalid FCM token for restaurant ${order.restaurant.id}`);
            }
          }
        }
      }
    }

    console.log(`Webhook processed: Transaction ${transactionId}, Status: ${isSuccess ? 'SUCCESS' : 'FAILED'}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error.message);
    res.status(200).json({ success: true });
  }
};

/**
 * Get payment history for a customer
 * GET /api/paymob/history
 */
const getPaymentHistory = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const offset = (page - 1) * limit;
    
    const whereClause = { customerId: customerId };
    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await PayMobOrder.findAndCountAll({
      where: whereClause,
      include: [{
        model: PayMobTransaction,
        as: 'transactions',
        attributes: ['id', 'transactionId', 'status', 'paymentMethod', 'verifiedAt']
      }, {
        model: Order,
        as: 'order',
        attributes: ['id', 'orderNumber', 'totalAmount', 'paymentStatus']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      message: 'Payment history retrieved successfully',
      data: {
        payments: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment history',
      error: error.message
    });
  }
};

/**
 * Get a specific payment order
 * GET /api/paymob/order/:id
 */
const getPaymentOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user.id;

    const paymobOrder = await PayMobOrder.findOne({
      where: { 
        id: id,
        customerId: customerId
      },
      include: [{
        model: PayMobTransaction,
        as: 'transactions'
      }, {
        model: Order,
        as: 'order',
        attributes: ['id', 'orderNumber', 'totalAmount', 'paymentStatus', 'deliveryStatus']
      }]
    });

    if (!paymobOrder) {
      return res.status(404).json({
        success: false,
        message: 'Payment order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment order retrieved successfully',
      data: paymobOrder
    });
  } catch (error) {
    console.error('Get payment order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment order',
      error: error.message
    });
  }
};

module.exports = {
  initiatePayment,
  createOrder,
  getPaymentStatus,
  verifyPayment,
  handleWebhook,
  getPaymentHistory,
  getPaymentOrder
};
