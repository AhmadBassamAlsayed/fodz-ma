const express = require('express');
const router = express.Router();
const paymobController = require('../controllers/paymob');
const { ensureActive } = require('../validaters');

/**
 * @openapi
 * tags:
 *   - name: PayMob
 *     description: PayMob payment gateway integration endpoints
 */

/**
 * @openapi
 * /api/paymob/initiate:
 *   post:
 *     summary: Initiate a payment
 *     description: Initiates a Paymob payment and returns iframe URL for card payment
 *     tags:
 *       - PayMob
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - billingData
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Payment amount in EGP
 *                 example: 100.50
 *               order_reference:
 *                 type: integer
 *                 description: Optional order ID to link payment to
 *                 example: 123
 *               billingData:
 *                 type: object
 *                 required:
 *                   - email
 *                   - first_name
 *                   - phone_number
 *                 properties:
 *                   email:
 *                     type: string
 *                     example: customer@example.com
 *                   first_name:
 *                     type: string
 *                     example: John
 *                   last_name:
 *                     type: string
 *                     example: Doe
 *                   phone_number:
 *                     type: string
 *                     example: "01234567890"
 *                   street:
 *                     type: string
 *                     example: Main Street
 *                   building:
 *                     type: string
 *                     example: Building 5
 *                   floor:
 *                     type: string
 *                     example: 3rd Floor
 *                   apartment:
 *                     type: string
 *                     example: Apt 12
 *                   city:
 *                     type: string
 *                     example: Cairo
 *                   country:
 *                     type: string
 *                     example: EG
 *                   postal_code:
 *                     type: string
 *                     example: "12345"
 *     responses:
 *       '201':
 *         description: Payment initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     iframe_url:
 *                       type: string
 *                     payment_id:
 *                       type: integer
 *                     paymob_order_id:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     status:
 *                       type: string
 *       '400':
 *         description: Invalid request data
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.post('/initiate', ensureActive, paymobController.initiatePayment);

/**
 * @openapi
 * /api/paymob/create-order:
 *   post:
 *     summary: Create a new payment order (legacy)
 *     description: Creates a payment order with PayMob and returns payment key for iframe integration
 *     tags:
 *       - PayMob
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - billingData
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Payment amount in primary currency
 *                 example: 100.50
 *               currency:
 *                 type: string
 *                 description: Currency code
 *                 default: EGP
 *                 example: EGP
 *               orderId:
 *                 type: integer
 *                 description: Optional order ID to link payment to
 *                 example: 123
 *               billingData:
 *                 type: object
 *                 required:
 *                   - email
 *                   - first_name
 *                   - phone_number
 *                 properties:
 *                   email:
 *                     type: string
 *                     example: customer@example.com
 *                   first_name:
 *                     type: string
 *                     example: John
 *                   last_name:
 *                     type: string
 *                     example: Doe
 *                   phone_number:
 *                     type: string
 *                     example: "01234567890"
 *                   street:
 *                     type: string
 *                     example: Main Street
 *                   building:
 *                     type: string
 *                     example: Building 5
 *                   floor:
 *                     type: string
 *                     example: 3rd Floor
 *                   apartment:
 *                     type: string
 *                     example: Apt 12
 *                   city:
 *                     type: string
 *                     example: Cairo
 *                   country:
 *                     type: string
 *                     example: EG
 *                   postal_code:
 *                     type: string
 *                     example: "12345"
 *     responses:
 *       '201':
 *         description: Payment order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     paymobOrderId:
 *                       type: string
 *                     orderId:
 *                       type: integer
 *                     amount:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     paymentKey:
 *                       type: string
 *                     iframeUrl:
 *                       type: string
 *                     status:
 *                       type: string
 *       '400':
 *         description: Invalid request data
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.post('/create-order', ensureActive, paymobController.createOrder);

/**
 * @openapi
 * /api/paymob/payment-status/{transactionId}:
 *   get:
 *     summary: Get payment status
 *     description: Retrieves the status of a payment transaction
 *     tags:
 *       - PayMob
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: PayMob transaction ID
 *     responses:
 *       '200':
 *         description: Transaction status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       '400':
 *         description: Transaction ID is required
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.get('/payment-status/:transactionId', ensureActive, paymobController.getPaymentStatus);

/**
 * @openapi
 * /api/paymob/verify/{transactionId}:
 *   post:
 *     summary: Verify a payment transaction
 *     description: Verifies a payment transaction with PayMob and updates database
 *     tags:
 *       - PayMob
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: PayMob transaction ID
 *     responses:
 *       '200':
 *         description: Payment verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       '400':
 *         description: Transaction ID is required
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.post('/verify/:transactionId', ensureActive, paymobController.verifyPayment);

/**
 * @openapi
 * /api/paymob/webhook:
 *   post:
 *     summary: PayMob webhook endpoint
 *     description: Receives payment notifications from PayMob (no authentication required)
 *     tags:
 *       - PayMob
 *     parameters:
 *       - in: query
 *         name: hmac
 *         schema:
 *           type: string
 *         description: HMAC signature for webhook verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: PayMob webhook payload
 *     responses:
 *       '200':
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 */
router.post('/webhook', paymobController.handleWebhook);

router.get('/webhook', paymobController.handleWebhook);

/**
 * @openapi
 * /api/paymob/history:
 *   get:
 *     summary: Get payment history
 *     description: Retrieves payment history for the authenticated customer
 *     tags:
 *       - PayMob
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status (pending, completed, failed, refunded)
 *     responses:
 *       '200':
 *         description: Payment history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     payments:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.get('/history', ensureActive, paymobController.getPaymentHistory);

/**
 * @openapi
 * /api/paymob/order/{id}:
 *   get:
 *     summary: Get a specific payment order
 *     description: Retrieves details of a specific payment order
 *     tags:
 *       - PayMob
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Payment order ID
 *     responses:
 *       '200':
 *         description: Payment order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       '404':
 *         description: Payment order not found
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.get('/order/:id', ensureActive, paymobController.getPaymentOrder);

module.exports = router;
