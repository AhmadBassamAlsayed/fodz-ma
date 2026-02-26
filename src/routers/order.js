const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order');
const {ensureActive, ensureDelivery, ensureAdmine} = require('../validaters.js');

/**
 * @openapi
 * tags:
 *   - name: Orders
 *     description: Manage customer and restaurant orders
 *   - name: Delivery Man Orders
 *     description: Delivery man order management and assignment
 */

/**
 * @openapi
 * /api/orders/pending/{customerId}:
 *   get:
 *     summary: Get pending orders for a customer
 *     description: Retrieves all pending orders for the specified customer. Returns formatted order data with restaurant info, products, offers, and addons.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer identifier
 *     responses:
 *       '200':
 *         description: Pending orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Pending orders retrieved successfully
 *                 count:
 *                   type: integer
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       photoURL:
 *                         type: string
 *                         example: https://www.kuducompany.com/@fs/var/www/kudu/attached_assets/k5.jpeg
 *                       restaurantName:
 *                         type: string
 *                         example: Pizza Palace
 *                       orderCreatingDate:
 *                         type: string
 *                         format: date-time
 *                       orderId:
 *                         type: integer
 *                       status:
 *                         type: string
 *                       totalQuantity:
 *                         type: integer
 *                         description: Total quantity of all products and combos in the order
 *                       products:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             productName:
 *                               type: string
 *                             quantity:
 *                               type: integer
 *                             orderItemNote:
 *                               type: string
 *                               nullable: true
 *                             offer:
 *                               type: object
 *                               nullable: true
 *                             addons:
 *                               type: array
 *                               items:
 *                                 type: string
 *                       combos:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             comboName:
 *                               type: string
 *                             quantity:
 *                               type: integer
 *                             orderItemNote:
 *                               type: string
 *                               nullable: true
 *                             addons:
 *                               type: array
 *                               items:
 *                                 type: string
 *                             products:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   name:
 *                                     type: string
 *                                   quantity:
 *                                     type: integer
 *                       totalAmount:
 *                         type: string
 *                         description: Total amount with offers and addons applied
 *       '400':
 *         description: Invalid customer ID
 *       '500':
 *         description: Server error
 */
router.get('/pending/:customerId', ensureActive, orderController.getPendingOrders); // req

/**
 * @openapi
 * /api/orders/accepted/{customerId}:
 *   get:
 *     summary: Get accepted orders for a customer
 *     description: Retrieves all accepted orders for the specified customer. Returns formatted order data with restaurant info, products, offers, and addons.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer identifier
 *     responses:
 *       '200':
 *         description: Accepted orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Accepted orders retrieved successfully
 *                 count:
 *                   type: integer
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       photoURL:
 *                         type: string
 *                         example: https://www.kuducompany.com/@fs/var/www/kudu/attached_assets/k5.jpeg
 *                       restaurantName:
 *                         type: string
 *                         example: Pizza Palace
 *                       orderCreatingDate:
 *                         type: string
 *                         format: date-time
 *                       orderId:
 *                         type: integer
 *                       status:
 *                         type: string
 *                       totalQuantity:
 *                         type: integer
 *                         description: Total quantity of all products and combos in the order
 *                       products:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             productName:
 *                               type: string
 *                             quantity:
 *                               type: integer
 *                             orderItemNote:
 *                               type: string
 *                               nullable: true
 *                             offer:
 *                               type: object
 *                               nullable: true
 *                             addons:
 *                               type: array
 *                               items:
 *                                 type: string
 *                       combos:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             comboName:
 *                               type: string
 *                             quantity:
 *                               type: integer
 *                             orderItemNote:
 *                               type: string
 *                               nullable: true
 *                             addons:
 *                               type: array
 *                               items:
 *                                 type: string
 *                             products:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   name:
 *                                     type: string
 *                                   quantity:
 *                                     type: integer
 *                       totalAmount:
 *                         type: string
 *                         description: Total amount with offers and addons applied
 *       '400':
 *         description: Invalid customer ID
 *       '500':
 *         description: Server error
 */
router.get('/accepted/:customerId', ensureActive, orderController.getAcceptedOrders); // req

/**
 * @openapi
 * /api/orders/shipped/{customerId}:
 *   get:
 *     summary: Get shipped orders for a customer
 *     description: Retrieves all shipped orders for the specified customer. Returns formatted order data with restaurant info, products, offers, and addons.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer identifier
 *     responses:
 *       '200':
 *         description: Shipped orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Shipped orders retrieved successfully
 *                 count:
 *                   type: integer
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       photoURL:
 *                         type: string
 *                         example: https://www.kuducompany.com/@fs/var/www/kudu/attached_assets/k5.jpeg
 *                       restaurantName:
 *                         type: string
 *                         example: Pizza Palace
 *                       orderCreatingDate:
 *                         type: string
 *                         format: date-time
 *                       orderId:
 *                         type: integer
 *                       status:
 *                         type: string
 *                       totalQuantity:
 *                         type: integer
 *                         description: Total quantity of all products and combos in the order
 *                       products:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             productName:
 *                               type: string
 *                             quantity:
 *                               type: integer
 *                             orderItemNote:
 *                               type: string
 *                               nullable: true
 *                             offer:
 *                               type: object
 *                               nullable: true
 *                             addons:
 *                               type: array
 *                               items:
 *                                 type: string
 *                       combos:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             comboName:
 *                               type: string
 *                             quantity:
 *                               type: integer
 *                             orderItemNote:
 *                               type: string
 *                               nullable: true
 *                             addons:
 *                               type: array
 *                               items:
 *                                 type: string
 *                             products:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   name:
 *                                     type: string
 *                                   quantity:
 *                                     type: integer
 *                       totalAmount:
 *                         type: string
 *                         description: Total amount with offers and addons applied
 *       '400':
 *         description: Invalid customer ID
 *       '500':
 *         description: Server error
 */
router.get('/shipped/:customerId', ensureActive, orderController.getShippedOrders); // req

/**
 * @openapi
 * /api/orders/completed/{customerId}:
 *   get:
 *     summary: Get completed orders for a customer
 *     description: Retrieves all completed orders for the specified customer. Returns formatted order data with restaurant info, products, offers, and addons.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer identifier
 *     responses:
 *       '200':
 *         description: Completed orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Completed orders retrieved successfully
 *                 count:
 *                   type: integer
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       photoURL:
 *                         type: string
 *                         example: https://www.kuducompany.com/@fs/var/www/kudu/attached_assets/k5.jpeg
 *                       restaurantName:
 *                         type: string
 *                         example: Pizza Palace
 *                       orderCreatingDate:
 *                         type: string
 *                         format: date-time
 *                       orderId:
 *                         type: integer
 *                       status:
 *                         type: string
 *                       totalQuantity:
 *                         type: integer
 *                         description: Total quantity of all products and combos in the order
 *                       products:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             productName:
 *                               type: string
 *                             quantity:
 *                               type: integer
 *                             orderItemNote:
 *                               type: string
 *                               nullable: true
 *                             offer:
 *                               type: object
 *                               nullable: true
 *                             addons:
 *                               type: array
 *                               items:
 *                                 type: string
 *                       combos:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             comboName:
 *                               type: string
 *                             quantity:
 *                               type: integer
 *                             orderItemNote:
 *                               type: string
 *                               nullable: true
 *                             addons:
 *                               type: array
 *                               items:
 *                                 type: string
 *                             products:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   name:
 *                                     type: string
 *                                   quantity:
 *                                     type: integer
 *                       totalAmount:
 *                         type: string
 *                         description: Total amount with offers and addons applied
 *       '400':
 *         description: Invalid customer ID
 *       '500':
 *         description: Server error
 */
router.get('/completed/:customerId', ensureActive, orderController.getCompletedOrders); // req

/**
 * @openapi
 * /api/orders/denied/{customerId}:
 *   get:
 *     summary: Get denied orders for a customer
 *     description: Retrieves all denied orders for the specified customer. Returns formatted order data with restaurant info, products, offers, and addons.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer identifier
 *     responses:
 *       '200':
 *         description: Denied orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Denied orders retrieved successfully
 *                 count:
 *                   type: integer
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       photoURL:
 *                         type: string
 *                         example: https://www.kuducompany.com/@fs/var/www/kudu/attached_assets/k5.jpeg
 *                       restaurantName:
 *                         type: string
 *                         example: Pizza Palace
 *                       orderCreatingDate:
 *                         type: string
 *                         format: date-time
 *                       orderId:
 *                         type: integer
 *                       status:
 *                         type: string
 *                       denialReason:
 *                         type: string
 *                         description: Reason why the order was denied by the restaurant
 *                       totalQuantity:
 *                         type: integer
 *                         description: Total quantity of all products and combos in the order
 *                       products:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             productName:
 *                               type: string
 *                             quantity:
 *                               type: integer
 *                             orderItemNote:
 *                               type: string
 *                               nullable: true
 *                             offer:
 *                               type: object
 *                               nullable: true
 *                             addons:
 *                               type: array
 *                               items:
 *                                 type: string
 *                       combos:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             comboName:
 *                               type: string
 *                             quantity:
 *                               type: integer
 *                             orderItemNote:
 *                               type: string
 *                               nullable: true
 *                             addons:
 *                               type: array
 *                               items:
 *                                 type: string
 *                             products:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   name:
 *                                     type: string
 *                                   quantity:
 *                                     type: integer
 *                       totalAmount:
 *                         type: string
 *                         description: Total amount with offers and addons applied
 *       '400':
 *         description: Invalid customer ID
 *       '500':
 *         description: Server error
 */
router.get('/denied/:customerId', ensureActive, orderController.getDeniedOrders); // req

/**
 * @openapi
 * /api/orders/all/{customerId}:
 *   get:
 *     summary: Get all orders for a customer
 *     description: Retrieves all orders for the specified customer without pagination. Returns formatted order data with restaurant info, products, offers, and addons.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer identifier
 *     responses:
 *       '200':
 *         description: All orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All orders retrieved successfully
 *                 count:
 *                   type: integer
 *                   description: Total number of orders returned
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *       '400':
 *         description: Invalid customer ID
 *       '500':
 *         description: Server error
 */
router.get('/all/:customerId', ensureActive, orderController.getAllOrders); // req

// GET routes for restaurants (use ?type=restaurant)
/**
 * @openapi
 * /api/orders/restaurant/pending/{restaurantId}:
 *   get:
 *     summary: Get pending orders for a restaurant
 *     description: Retrieves all pending orders for the specified restaurant. Returns formatted order data with customer info, products, offers, and addons.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant identifier
 *     responses:
 *       '200':
 *         description: Pending orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Pending orders retrieved successfully
 *                 count:
 *                   type: integer
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       photoURL:
 *                         type: string
 *                         example: https://www.kuducompany.com/@fs/var/www/kudu/attached_assets/k5.jpeg
 *                       userFullName:
 *                         type: string
 *                         example: John Doe
 *                       restaurantName:
 *                         type: string
 *                         example: Pizza Palace
 *                       orderCreatingDate:
 *                         type: string
 *                         format: date-time
 *                       orderId:
 *                         type: integer
 *                       status:
 *                         type: string
 *                       totalQuantity:
 *                         type: integer
 *                         description: Total quantity of all products and combos in the order
 *                       products:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             productName:
 *                               type: string
 *                             quantity:
 *                               type: integer
 *                             orderItemNote:
 *                               type: string
 *                               nullable: true
 *                             offer:
 *                               type: object
 *                               nullable: true
 *                             addons:
 *                               type: array
 *                               items:
 *                                 type: string
 *                       combos:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             comboName:
 *                               type: string
 *                             quantity:
 *                               type: integer
 *                             orderItemNote:
 *                               type: string
 *                               nullable: true
 *                             addons:
 *                               type: array
 *                               items:
 *                                 type: string
 *                             products:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   name:
 *                                     type: string
 *                                   quantity:
 *                                     type: integer
 *                       totalAmount:
 *                         type: string
 *                         description: Total amount with offers and addons applied
 *       '400':
 *         description: Invalid restaurant ID
 *       '500':
 *         description: Server error
 */
router.get('/restaurant/pending/:restaurantId', ensureActive, orderController.getPendingOrders); // req

/**
 * @openapi
 * /api/orders/restaurant/accepted/{restaurantId}:
 *   get:
 *     summary: Get accepted orders for a restaurant
 *     description: Retrieves all accepted orders for the specified restaurant. Returns formatted order data with customer info, products, offers, and addons.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant identifier
 *     responses:
 *       '200':
 *         description: Accepted orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Accepted orders retrieved successfully
 *                 count:
 *                   type: integer
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *       '400':
 *         description: Invalid restaurant ID or missing type parameter
 *       '500':
 *         description: Server error
 */
router.get('/restaurant/accepted/:restaurantId', ensureActive, orderController.getAcceptedOrders); // req

/**
 * @openapi
 * /api/orders/restaurant/shipped/{restaurantId}:
 *   get:
 *     summary: Get shipped orders for a restaurant
 *     description: Retrieves all shipped orders for the specified restaurant. Returns formatted order data with customer info, products, offers, and addons.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant identifier
 *     responses:
 *       '200':
 *         description: Shipped orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Shipped orders retrieved successfully
 *                 count:
 *                   type: integer
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *       '400':
 *         description: Invalid restaurant ID or missing type parameter
 *       '500':
 *         description: Server error
 */
router.get('/restaurant/shipped/:restaurantId', ensureActive, orderController.getShippedOrders); // req

/**
 * @openapi
 * /api/orders/restaurant/completed/{restaurantId}:
 *   get:
 *     summary: Get completed orders for a restaurant
 *     description: Retrieves all completed orders for the specified restaurant. Returns formatted order data with customer info, products, offers, and addons.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant identifier
 *     responses:
 *       '200':
 *         description: Completed orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Completed orders retrieved successfully
 *                 count:
 *                   type: integer
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *       '400':
 *         description: Invalid restaurant ID or missing type parameter
 *       '500':
 *         description: Server error
 */
router.get('/restaurant/completed/:restaurantId', ensureActive, orderController.getCompletedOrders); // req

/**
 * @openapi
 * /api/orders/restaurant/denied/{restaurantId}:
 *   get:
 *     summary: Get denied orders for a restaurant
 *     description: Retrieves all denied orders for the specified restaurant. Returns formatted order data with customer info, products, offers, addons, and denial reason.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant identifier
 *     responses:
 *       '200':
 *         description: Denied orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Denied orders retrieved successfully
 *                 count:
 *                   type: integer
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       photoURL:
 *                         type: string
 *                       userFullName:
 *                         type: string
 *                         description: Customer name
 *                       restaurantName:
 *                         type: string
 *                       orderCreatingDate:
 *                         type: string
 *                         format: date-time
 *                       orderId:
 *                         type: integer
 *                       status:
 *                         type: string
 *                       denialReason:
 *                         type: string
 *                         description: Reason why the order was denied by the restaurant
 *                       totalQuantity:
 *                         type: integer
 *                       products:
 *                         type: array
 *                       totalAmount:
 *                         type: string
 *       '400':
 *         description: Invalid restaurant ID or missing type parameter
 *       '500':
 *         description: Server error
 */
router.get('/restaurant/denied/:restaurantId', ensureActive, orderController.getDeniedOrders); // req

/**
 * @openapi
 * /api/orders/restaurant/all/{restaurantId}:
 *   get:
 *     summary: Get all orders for a restaurant
 *     description: Retrieves all orders for the specified restaurant without pagination. Returns formatted order data with customer info, products, offers, and addons.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant identifier
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [restaurant]
 *         description: Must be set to 'restaurant'
 *     responses:
 *       '200':
 *         description: All orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All orders retrieved successfully
 *                 count:
 *                   type: integer
 *                   description: Total number of orders returned
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *       '400':
 *         description: Invalid restaurant ID or missing type parameter
 *       '500':
 *         description: Server error
 */
router.get('/restaurant/all/:restaurantId', ensureActive, orderController.getAllOrders); // req


// delevary man routes

/**
 * @openapi
 * /api/orders/delivery/completed-unassigned:
 *   get:
 *     summary: List completed orders without assigned delivery man
 *     description: |
 *       Retrieves all orders that are completed but not yet assigned to a delivery man.
 *       - Requires delivery man authentication
 *       - Only shows orders with status='completed' and deliveryManId=null
 *       - Orders sorted by creation date (oldest first)
 *     tags:
 *       - Delivery Man Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Completed unassigned orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Completed unassigned orders retrieved successfully
 *                 count:
 *                   type: integer
 *                   description: Total number of orders
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       orderNumber:
 *                         type: string
 *                       status:
 *                         type: string
 *                       deliveryStatus:
 *                         type: string
 *                       totalAmount:
 *                         type: number
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       customer:
 *                         type: object
 *                       restaurant:
 *                         type: object
 *                       address:
 *                         type: object
 *       '401':
 *         description: Unauthorized - Missing or invalid token
 *       '403':
 *         description: Forbidden - Not a delivery man account
 *       '500':
 *         description: Server error
 */
router.get('/delivery/completed-unassigned', ensureActive, orderController.listCompletedUnassignedOrders);

/**
 * @openapi
 * /api/orders/delivery/orders:
 *   get:
 *     summary: List orders assigned to a specific delivery man
 *     description: |
 *       Retrieves all orders assigned to the authenticated delivery man.
 *       - Requires delivery man authentication
 *       - deliveryManId must be provided as query parameter and match authenticated user's ID
 *       - Only shows orders with status 'shipping' or 'shipped'
 *     tags:
 *       - Delivery Man Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: deliveryManId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Delivery man ID (must match authenticated user)
 *     responses:
 *       '200':
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Your orders retrieved successfully
 *                 count:
 *                   type: integer
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *       '400':
 *         description: Invalid delivery man ID
 *       '401':
 *         description: Unauthorized - Missing or invalid token
 *       '403':
 *         description: Forbidden - deliveryManId does not match authenticated user
 *       '500':
 *         description: Server error
 */
router.get('/delivery/orders', ensureActive, orderController.listOrdersForDeliveryMan);

/**
 * @openapi
 * /api/orders/delivery/orders/shipping:
 *   put:
 *     summary: Accept an order for delivery (mark as shipping)
 *     description: |
 *       Marks a completed order as shipping and assigns it to the delivery man.
 *       - Requires delivery man authentication
 *       - Order must be in 'completed' status with no assigned delivery man
 *       - deliveryManId must be provided as query parameter and match authenticated user's ID
 *       - orderId must be provided in request body
 *     tags:
 *       - Delivery Man Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: deliveryManId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Delivery man ID (must match authenticated user)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: integer
 *                 description: Order ID to accept
 *     responses:
 *       '200':
 *         description: Order accepted for delivery successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order accepted for delivery successfully
 *                 order:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     orderNumber:
 *                       type: string
 *                     status:
 *                       type: string
 *                     deliveryStatus:
 *                       type: string
 *                     deliveryManId:
 *                       type: integer
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       '400':
 *         description: Invalid request or order not in completed status
 *       '401':
 *         description: Unauthorized - Missing or invalid token
 *       '403':
 *         description: Forbidden - deliveryManId does not match authenticated user
 *       '404':
 *         description: Order not found
 *       '500':
 *         description: Server error
 */
router.put('/delivery/orders/shipping', ensureActive, orderController.markOrderShipping);

/**
 * @openapi
 * /api/orders/delivery/orders/shipped:
 *   put:
 *     summary: Mark an order as shipped (delivery completed)
 *     description: |
 *       Marks a shipping order as shipped (delivered).
 *       - Requires delivery man authentication
 *       - Order must be in 'shipping' status and assigned to this delivery man
 *       - deliveryManId must be provided as query parameter and match authenticated user's ID
 *       - orderId must be provided in request body
 *       - Automatically increases restaurant wallet by system fees amount
 *     tags:
 *       - Delivery Man Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: deliveryManId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Delivery man ID (must match authenticated user)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: integer
 *                 description: Order ID to mark as shipped
 *     responses:
 *       '200':
 *         description: Order marked as shipped successfully with restaurant wallet increase
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order marked as shipped successfully
 *                 order:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     orderNumber:
 *                       type: string
 *                     status:
 *                       type: string
 *                     deliveryStatus:
 *                       type: string
 *                     deliveryManId:
 *                       type: integer
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 restaurantWalletIncrease:
 *                   type: object
 *                   properties:
 *                     amount:
 *                       type: number
 *                       format: decimal
 *                       description: System fees amount added to restaurant wallet
 *                     newBalance:
 *                       type: number
 *                       format: decimal
 *                       description: New restaurant wallet balance after increase
 *       '400':
 *         description: Invalid request or order not in shipping status
 *       '401':
 *         description: Unauthorized - Missing or invalid token
 *       '403':
 *         description: Forbidden - deliveryManId does not match authenticated user
 *       '404':
 *         description: Order not found or not assigned to you
 *       '500':
 *         description: Server error
 */
router.put('/delivery/orders/shipped', ensureActive, orderController.markOrderShipped);


// POST routes for order status management
/**
 * @openapi
 * /api/orders/accept-or-deny:
 *   post:
 *     summary: Accept or deny a pending order
 *     description: Allows a restaurant to accept or deny an order. Order must be in pending status. When denying, a denial reason must be provided.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - action
 *             properties:
 *               orderId:
 *                 type: integer
 *                 description: Order identifier
 *               action:
 *                 type: string
 *                 enum: [accept, deny]
 *                 description: Action to perform on the order
 *               denialReason:
 *                 type: string
 *                 description: Reason for denying the order (required when action is 'deny')
 *     responses:
 *       '200':
 *         description: Order accepted or denied successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order accepted successfully
 *                 order:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     orderNumber:
 *                       type: string
 *                     status:
 *                       type: string
 *                     denialReason:
 *                       type: string
 *                       description: Reason for denial (only present when order is denied)
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       '400':
 *         description: Invalid request, order not in pending status, or missing denial reason when denying
 *       '404':
 *         description: Order not found
 *       '500':
 *         description: Server error
 */
router.post('/accept-or-deny',ensureActive, orderController.acceptOrDenyOrder); // req

/**
 * @openapi
 * /api/orders/ship:
 *   post:
 *     summary: Mark an order as shipped
 *     description: Marks a completed order as shipped and optionally assigns a delivery person. Order must be in completed status.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: integer
 *                 description: Order identifier
 *               deliveryManId:
 *                 type: integer
 *                 description: Delivery person identifier (optional)
 *     responses:
 *       '200':
 *         description: Order shipped successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order shipped successfully
 *                 order:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     orderNumber:
 *                       type: string
 *                     status:
 *                       type: string
 *                     deliveryStatus:
 *                       type: string
 *                     deliveryManId:
 *                       type: integer
 *                       nullable: true
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       '400':
 *         description: Invalid request or order not in completed status
 *       '404':
 *         description: Order not found
 *       '500':
 *         description: Server error
 */
router.post('/ship', ensureActive, orderController.shipOrder); // req

/**
 * @openapi
 * /api/orders/complete:
 *   post:
 *     summary: Mark an order as completed
 *     description: Marks an accepted order as completed. Order must be in accepted status.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: integer
 *                 description: Order identifier
 *     responses:
 *       '200':
 *         description: Order completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order completed successfully
 *                 order:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     orderNumber:
 *                       type: string
 *                     status:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       '400':
 *         description: Invalid request or order not in accepted status
 *       '404':
 *         description: Order not found
 *       '500':
 *         description: Server error
 */
router.post('/complete', ensureActive, orderController.completeOrder); // req

/**
 * @openapi
 * /api/orders/delivery/my-completed-orders:
 *   get:
 *     summary: Get my assigned orders where status is completed
 *     description: |
 *       Retrieves all orders assigned to the authenticated delivery man with completed status.
 *       - Requires delivery man authentication
 *       - deliveryManId must be provided as query parameter and match authenticated user
 *     tags:
 *       - Delivery Man Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: deliveryManId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Delivery man ID (must match authenticated user)
 *     responses:
 *       '200':
 *         description: Completed orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Your completed orders retrieved successfully
 *                 count:
 *                   type: integer
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *       '400':
 *         description: Invalid delivery man ID
 *       '401':
 *         description: Unauthorized - Missing or invalid token
 *       '403':
 *         description: Forbidden - deliveryManId does not match authenticated user
 *       '500':
 *         description: Server error
 */
router.get('/delivery/my-completed-orders', ensureActive, orderController.getMyCompletedOrders);

/**
 * @openapi
 * /api/orders/delivery/my-shipped-orders:
 *   get:
 *     summary: Get my assigned orders where status is shipped
 *     description: |
 *       Retrieves all orders assigned to the authenticated delivery man with shipped status.
 *       - Requires delivery man authentication
 *       - deliveryManId must be provided as query parameter and match authenticated user
 *     tags:
 *       - Delivery Man Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: deliveryManId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Delivery man ID (must match authenticated user)
 *     responses:
 *       '200':
 *         description: Shipped orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Your shipped orders retrieved successfully
 *                 count:
 *                   type: integer
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *       '400':
 *         description: Invalid delivery man ID
 *       '401':
 *         description: Unauthorized - Missing or invalid token
 *       '403':
 *         description: Forbidden - deliveryManId does not match authenticated user
 *       '500':
 *         description: Server error
 */
router.get('/delivery/my-shipped-orders', ensureActive, orderController.getMyShippedOrders);

/**
 * @openapi
 * /api/orders/delivery/assign-order:
 *   put:
 *     summary: Assign a non-assigned order to me
 *     description: |
 *       Assigns an unassigned order to the authenticated delivery man.
 *       - Requires delivery man authentication
 *       - deliveryManId must be provided as query parameter and match authenticated user
 *       - orderId must be provided in request body
 *       - Order must not be already assigned to another delivery man
 *     tags:
 *       - Delivery Man Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: deliveryManId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Delivery man ID (must match authenticated user)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: integer
 *                 description: Order ID to assign
 *     responses:
 *       '200':
 *         description: Order assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order assigned to you successfully
 *                 order:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     orderNumber:
 *                       type: string
 *                     status:
 *                       type: string
 *                     deliveryStatus:
 *                       type: string
 *                     deliveryManId:
 *                       type: integer
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       '400':
 *         description: Invalid request or order already assigned
 *       '401':
 *         description: Unauthorized - Missing or invalid token
 *       '403':
 *         description: Forbidden - deliveryManId does not match authenticated user
 *       '404':
 *         description: Order not found
 *       '500':
 *         description: Server error
 */
router.put('/delivery/assign-order', ensureActive, orderController.assignOrderToMe);

/**
 * @openapi
 * /api/orders/fcode/{fcode}:
 *   get:
 *     summary: Get order by FCODE
 *     description: Retrieves an order using its unique FCODE (format orderId-9randomChars). Returns formatted order data with restaurant info, products, offers, and addons.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: fcode
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique FCODE of the order (e.g., 123-ABC123XYZ)
 *     responses:
 *       '200':
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     photoUrl:
 *                       type: string
 *                       nullable: true
 *                     userFullName:
 *                       type: string
 *                       example: John Doe
 *                     restaurantName:
 *                       type: string
 *                       example: Pizza Palace
 *                     orderCreatingDate:
 *                       type: string
 *                       format: date-time
 *                     orderId:
 *                       type: integer
 *                     isPlessing:
 *                       type: boolean
 *                     status:
 *                       type: string
 *                     denialReason:
 *                       type: string
 *                       description: Present only if status is denied
 *                     totalQuantity:
 *                       type: integer
 *                       description: Total quantity of all products and combos in the order
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productName:
 *                             type: string
 *                           quantity:
 *                             type: integer
 *                           orderItemNote:
 *                             type: string
 *                             nullable: true
 *                           offer:
 *                             type: object
 *                             nullable: true
 *                           addons:
 *                             type: array
 *                             items:
 *                               type: string
 *                     combos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           comboName:
 *                             type: string
 *                           quantity:
 *                             type: integer
 *                           orderItemNote:
 *                             type: string
 *                             nullable: true
 *                           addons:
 *                             type: array
 *                             items:
 *                               type: string
 *                           products:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                 quantity:
 *                                   type: integer
 *                     totalAmount:
 *                       type: string
 *                       description: Total amount with offers and addons applied
 *       '400':
 *         description: FCODE is required
 *       '404':
 *         description: Order not found with this FCODE
 *       '500':
 *         description: Server error
 */
router.get('/fcode/:fcode', orderController.getOrderByFcode);

/**
 * @openapi
 * /api/orders/unpaid:
 *   get:
 *     summary: Get unpaid orders for customer
 *     description: Retrieves all unpaid orders (awaiting payment) for the authenticated customer with pagination
 *     tags:
 *       - Orders
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
 *     responses:
 *       '200':
 *         description: Unpaid orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *       '500':
 *         description: Server error
 */
router.get('/unpaid', ensureActive, orderController.getUnpaidOrders);

/**
 * @openapi
 * /api/orders/unpaid/{orderId}/cancel:
 *   post:
 *     summary: Cancel an unpaid order
 *     description: Cancels an unpaid order that hasn't been paid yet
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       '200':
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 order:
 *                   type: object
 *       '404':
 *         description: Unpaid order not found
 *       '500':
 *         description: Server error
 */
router.post('/unpaid/:orderId/cancel', ensureActive, orderController.cancelUnpaidOrder);

/**
 * @openapi
 * /api/orders/unpaid/{orderId}/retry-payment:
 *   post:
 *     summary: Retry payment for an unpaid order
 *     description: Generates a new Paymob payment link for an unpaid order
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       '200':
 *         description: Payment retry initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 order:
 *                   type: object
 *                 payment:
 *                   type: object
 *                   properties:
 *                     iframe_url:
 *                       type: string
 *                     payment_token:
 *                       type: string
 *                     paymob_order_id:
 *                       type: integer
 *       '404':
 *         description: Unpaid order not found
 *       '500':
 *         description: Failed to initiate payment retry
 */
router.post('/unpaid/:orderId/retry-payment', ensureActive, orderController.retryPayment);

/**
 * @openapi
 * /api/orders/friend-payment/{fcode}:
 *   get:
 *     summary: View order details for friend payment (public access - no authentication required)
 *     description: |
 *       Retrieves complete order information using the unique fcode for friend payment purposes. 
 *       This endpoint is publicly accessible (no authentication required) to allow friends to view order details before paying.
 *       
 *       **Use Case:** When a customer creates an order with paymentMethod='friend', they receive a shareable URL containing the fcode. 
 *       The friend can use this URL to view the order details including products, quantities, prices, and total amount before proceeding with payment.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: fcode
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique order FCODE (format "orderId-RANDOMCHARS", e.g., "123-ABC123XYZ")
 *         example: "123-ABC123XYZ"
 *     responses:
 *       '200':
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     photoUrl:
 *                       type: string
 *                       nullable: true
 *                     userFullName:
 *                       type: string
 *                       description: Customer name who created the order
 *                       example: John Doe
 *                     restaurantName:
 *                       type: string
 *                       example: Pizza Palace
 *                     orderCreatingDate:
 *                       type: string
 *                       format: date-time
 *                     orderId:
 *                       type: integer
 *                     fcode:
 *                       type: string
 *                       example: "123-ABC123XYZ"
 *                     isPlessing:
 *                       type: boolean
 *                     status:
 *                       type: string
 *                       example: unpaid
 *                     totalQuantity:
 *                       type: integer
 *                       description: Total quantity of all items
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productName:
 *                             type: string
 *                           quantity:
 *                             type: integer
 *                           orderItemNote:
 *                             type: string
 *                             nullable: true
 *                           offer:
 *                             type: object
 *                             nullable: true
 *                           addons:
 *                             type: array
 *                             items:
 *                               type: string
 *                     combos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           comboName:
 *                             type: string
 *                           quantity:
 *                             type: integer
 *                           orderItemNote:
 *                             type: string
 *                             nullable: true
 *                           addons:
 *                             type: array
 *                             items:
 *                               type: string
 *                           products:
 *                             type: array
 *                             items:
 *                               type: object
 *                     totalAmount:
 *                       type: string
 *                       description: Total order amount
 *                       example: "45.99"
 *       '400':
 *         description: FCODE is required
 *       '404':
 *         description: Order not found with this FCODE
 *       '500':
 *         description: Server error
 */
router.get('/friend-payment/:fcode', orderController.getOrderByFcode);

/**
 * @openapi
 * /api/orders/friend-payment/{fcode}/pay:
 *   post:
 *     summary: Process friend payment for an order (public access - no authentication required)
 *     description: |
 *       Initiates the payment process for a friend payment order using the unique fcode. 
 *       This endpoint is publicly accessible (no authentication required) to allow friends to pay for orders without needing an account.
 *       
 *       **Payment Flow:**
 *       1. Friend receives shareable URL with fcode from customer
 *       2. Friend views order details via GET /api/orders/friend-payment/{fcode}
 *       3. Friend calls this endpoint to initiate payment
 *       4. System validates order is unpaid and has paymentMethod='friend'
 *       5. Paymob payment session is created with friend's billing information
 *       6. Friend receives payment iframe URL to complete payment
 *       7. After successful payment, webhook updates order status to 'paid' and 'pending'
 *       8. Restaurant receives notification about the new paid order
 *       
 *       **Note:** Billing information in request body is optional. If not provided, default values will be used.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: fcode
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique order FCODE (format "orderId-RANDOMCHARS", e.g., "123-ABC123XYZ")
 *         example: "123-ABC123XYZ"
 *     requestBody:
 *       required: false
 *       description: Optional billing information for the friend making the payment. If not provided, default values will be used.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Friend's email address
 *                 example: friend@example.com
 *               firstName:
 *                 type: string
 *                 description: Friend's first name
 *                 example: John
 *               lastName:
 *                 type: string
 *                 description: Friend's last name
 *                 example: Doe
 *               phoneNumber:
 *                 type: string
 *                 description: Friend's phone number (Egyptian format)
 *                 example: "01234567890"
 *           examples:
 *             withBillingInfo:
 *               summary: With billing information
 *               value:
 *                 email: friend@example.com
 *                 firstName: John
 *                 lastName: Doe
 *                 phoneNumber: "01234567890"
 *             withoutBillingInfo:
 *               summary: Without billing information (uses defaults)
 *               value: {}
 *     responses:
 *       '200':
 *         description: Payment initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Friend payment initiated successfully
 *                 order:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: Order ID
 *                       example: 123
 *                     orderNumber:
 *                       type: string
 *                       description: Unique order number
 *                       example: "ORD-1704201600000-1"
 *                     totalAmount:
 *                       type: number
 *                       description: Total amount to be paid
 *                       example: 45.99
 *                     customerName:
 *                       type: string
 *                       description: Name of the customer who created the order
 *                       example: John Doe
 *                 payment:
 *                   type: object
 *                   description: Paymob payment details
 *                   properties:
 *                     iframe_url:
 *                       type: string
 *                       description: Paymob payment iframe URL - redirect friend to this URL to complete payment
 *                       example: "https://accept.paymob.com/api/acceptance/iframes/123456?payment_token=abc123xyz"
 *                     payment_token:
 *                       type: string
 *                       description: Paymob payment token
 *                       example: "abc123xyz"
 *                     paymob_order_id:
 *                       type: integer
 *                       description: Paymob order ID for tracking
 *                       example: 98765432
 *             example:
 *               success: true
 *               message: Friend payment initiated successfully
 *               order:
 *                 id: 123
 *                 orderNumber: "ORD-1704201600000-1"
 *                 totalAmount: 45.99
 *                 customerName: John Doe
 *               payment:
 *                 iframe_url: "https://accept.paymob.com/api/acceptance/iframes/123456?payment_token=abc123xyz"
 *                 payment_token: "abc123xyz"
 *                 paymob_order_id: 98765432
 *       '400':
 *         description: FCODE is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: FCODE is required
 *       '404':
 *         description: Order not found or payment already completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order not found or payment already completed
 *       '500':
 *         description: Failed to process friend payment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to process friend payment
 *                 error:
 *                   type: string
 *                   description: Error details
 */
router.post('/friend-payment/:fcode/pay', orderController.processFriendPayment);

/**
 * @openapi
 * /api/orders/admin/cancel-approved-cash:
 *   post:
 *     summary: Admin cancels an approved cash order
 *     description: Allows admin to cancel an order that is in accepted status with cash payment method
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - cancellationReason
 *             properties:
 *               orderId:
 *                 type: integer
 *                 example: 123
 *               cancellationReason:
 *                 type: string
 *                 example: "Customer requested cancellation"
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order cancelled successfully"
 *                 order:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       example: "cancelled"
 *                     deliveryStatus:
 *                       type: string
 *                       example: "cancelled"
 *                     cancellationReason:
 *                       type: string
 *       400:
 *         description: Invalid request or order cannot be cancelled
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.post('/admin/cancel-approved-cash', ensureAdmine, orderController.adminCancelApprovedCashOrder);

module.exports = router;