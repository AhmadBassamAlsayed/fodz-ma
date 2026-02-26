const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const catsController = require('../controllers/cats');
const { ensureAdmine } = require('../validaters');

// 

/**
 * @openapi
 * tags:
 *   - name: Admin
 *     description: Admin management endpoints
 */

/**
 * @openapi
 * /api/admin/restaurants:
 *   get:
 *     summary: List all restaurants with average ratings
 *     description: |
 *       Retrieves all restaurants with their details and average rating.
 *       - Requires admin authentication
 *       - Returns restaurants sorted by creation date (newest first)
 *       - Includes average rating calculated from rates table
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Restaurants retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Restaurants retrieved successfully
 *                 restaurants:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       phoneNumber:
 *                         type: string
 *                       emailAddress:
 *                         type: string
 *                         nullable: true
 *                       status:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       isVerified:
 *                         type: boolean
 *                       type:
 *                         type: string
 *                       city:
 *                         type: string
 *                       country:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       averageRating:
 *                         type: number
 *                         format: decimal
 *       '401':
 *         description: Unauthorized - Missing or invalid token
 *       '403':
 *         description: Forbidden - Not an admin account
 *       '500':
 *         description: Server error
 */
router.get('/restaurants', ensureAdmine, adminController.listRestaurants);

/**
 * @openapi
 * /api/admin/delete-restaurant/{resId}:
 *   put:
 *     summary: Delete a restaurant
 *     description: |
 *       Soft-deletes a restaurant by setting isDeleted=true, isActive=false, isVerified=false,
 *       and removes authentication data (password and fcmToken).
 *       - Requires admin authentication
 *       - Restaurant must exist in the database
 *       - Sets isDeleted, isActive, and isVerified flags
 *       - Removes password and fcmToken for security
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resId
 *         description: Restaurant unique identifier
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Restaurant deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Restaurant deleted successfully
 *       '404':
 *         description: Restaurant not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Restaurant not found
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 *                 error:
 *                   type: string
 */
router.put('/delete-restaurant/:resId', ensureAdmine, adminController.deleteRestaurant);

/**
 * @openapi
 * /api/admin/warnings:
 *   post:
 *     summary: Create a warning for a delivery man
 *     description: Admin creates a warning for a delivery man and sends a notification
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deliveryManId
 *               - title
 *               - body
 *             properties:
 *               deliveryManId:
 *                 type: integer
 *                 example: 1
 *               title:
 *                 type: string
 *                 example: "Late Delivery Warning"
 *               body:
 *                 type: string
 *                 example: "You have been late on 3 deliveries this week. Please improve your punctuality."
 *     responses:
 *       201:
 *         description: Warning created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Warning created and notification sent successfully"
 *                 warning:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     deliveryManId:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     body:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Delivery man not found
 *       500:
 *         description: Server error
 */
router.post('/warnings', ensureAdmine, adminController.createWarning);

/**
 * @openapi
 * /api/admin/act-restaurants:
 *   get:
 *     summary: List all active restaurants
 *     description: Retrieves all active, verified restaurants for admin use (e.g., creating home ads)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active restaurants fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Active restaurants fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Pizza Palace"
 *                       photoUrl:
 *                         type: string
 *                         example: "https://example.com/photo.jpg"
 *                       coverUrl:
 *                         type: string
 *                         example: "https://example.com/cover.jpg"
 *                       type:
 *                         type: string
 *                         example: "restaurant"
 *                       description:
 *                         type: string
 *                         example: "Best pizza in town"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Not an admin account
 *       500:
 *         description: Server error
 */
router.get('/act-restaurants',ensureAdmine,adminController.listActRes);

/**
 * @openapi
 * /api/admin/orders:
 *   get:
 *     summary: List all orders with user and restaurant details
 *     description: |
 *       Retrieves all orders with customer and restaurant information.
 *       - Requires admin authentication
 *       - Returns orders sorted by creation date (newest first)
 *       - Includes customer ID, name, phone number
 *       - Includes restaurant ID and name
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
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
 *                   example: Orders retrieved successfully
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
 *                       paymentStatus:
 *                         type: string
 *                       totalAmount:
 *                         type: number
 *                         format: decimal
 *                       deliveryStatus:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       customer:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           phoneNumber:
 *                             type: string
 *                       restaurant:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *       '401':
 *         description: Unauthorized - Missing or invalid token
 *       '403':
 *         description: Forbidden - Not an admin account
 *       '500':
 *         description: Server error
 */
router.get('/orders', ensureAdmine, adminController.listOrders);

/**
 * @openapi
 * /api/admin/banned-users:
 *   get:
 *     summary: List all banned users
 *     description: |
 *       Retrieves all users with banned status.
 *       - Requires admin authentication
 *       - Returns users sorted by update date (newest first)
 *       - Includes ban reason
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Banned users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Banned users retrieved successfully
 *                 bannedUsers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       phoneNumber:
 *                         type: string
 *                       banReason:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       '401':
 *         description: Unauthorized - Missing or invalid token
 *       '403':
 *         description: Forbidden - Not an admin account
 *       '500':
 *         description: Server error
 */
router.get('/banned-users', ensureAdmine, adminController.listBannedUsers);

/**
 * @openapi
 * /api/admin/all-users:
 *   get:
 *     summary: Get all users
 *     description: |
 *       Retrieves a list of all customers (users) in the system.
 *       - Requires admin authentication
 *       - Excludes deleted users
 *       - Excludes banned users
 *       - Returns users ordered by creation date (newest first)
 *       - Includes city from user's default address (if available)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Users retrieved successfully
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       phoneNumber:
 *                         type: string
 *                       emailAddress:
 *                         type: string
 *                       emailVerified:
 *                         type: boolean
 *                       isActive:
 *                         type: boolean
 *                       status:
 *                         type: string
 *                       lastLogin:
 *                         type: string
 *                         format: date-time
 *                       banReason:
 *                         type: string
 *                         nullable: true
 *                       city:
 *                         type: string
 *                         nullable: true
 *                         description: City from user's default address
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       '401':
 *         description: Unauthorized - Missing or invalid token
 *       '403':
 *         description: Forbidden - Not an admin account
 *       '500':
 *         description: Server error
 */
router.get('/all-users', ensureAdmine, adminController.listAllUsers)

/**
 * @openapi
 * /api/admin/ban-user/{userId}:
 *   post:
 *     summary: Ban a user
 *     description: |
 *       Bans a user by setting their status to 'banned' and recording the reason.
 *       - Requires admin authentication
 *       - Ban reason is required
 *       - Updates the user's status and audit fields
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to ban
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - banReason
 *             properties:
 *               banReason:
 *                 type: string
 *                 description: Reason for banning the user
 *                 example: Violated terms of service
 *     responses:
 *       '200':
 *         description: User banned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User banned successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     phoneNumber:
 *                       type: string
 *                     status:
 *                       type: string
 *                     banReason:
 *                       type: string
 *       '400':
 *         description: Bad request - Missing ban reason or user already banned
 *       '401':
 *         description: Unauthorized - Missing or invalid token
 *       '403':
 *         description: Forbidden - Not an admin account
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Server error
 */
router.post('/ban-user/:userId', ensureAdmine, adminController.banUser);

/**
 * @openapi
 * /api/admin/accept-restaurant/{resId}:
 *   post:
 *     summary: Accept and activate a restaurant
 *     description: |
 *       Accepts a restaurant application by setting its status to 'active', 
 *       marking it as verified, and activating it. This makes the restaurant 
 *       visible and accessible in the system.
 *       - Requires admin authentication
 *       - Restaurant must exist in the database
 *       - Updates status, isVerified, and isActive fields
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resId
 *         description: Restaurant unique identifier
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Restaurant accepted and activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Restaurant accepted and activated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: Restaurant ID
 *                     name:
 *                       type: string
 *                       description: Restaurant name
 *                     status:
 *                       type: string
 *                       example: active
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *       '400':
 *         description: Invalid restaurant identifier
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid restaurant identifier
 *       '404':
 *         description: Restaurant not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Restaurant not found
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 *                 error:
 *                   type: string
 */
router.post('/accept-restaurant/:resId',ensureAdmine,adminController.acceptRestaurant)

/**
 * @openapi
 * /api/admin/pending-restaurants:
 *   get:
 *     summary: List all pending restaurants
 *     description: |
 *       Retrieves all restaurants that are not yet verified but are active.
 *       - Requires admin authentication
 *       - Returns restaurants with isVerified=false and isActive=true
 *       - Sorted by creation date (newest first)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Pending restaurants retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Pending restaurants retrieved successfully
 *                 restaurants:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       phoneNumber:
 *                         type: string
 *                       emailAddress:
 *                         type: string
 *                         nullable: true
 *                       status:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       isVerified:
 *                         type: boolean
 *                       type:
 *                         type: string
 *                       city:
 *                         type: string
 *                       country:
 *                         type: string
 *                       photoUrl:
 *                         type: string
 *                         nullable: true
 *                       coverUrl:
 *                         type: string
 *                         nullable: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       '401':
 *         description: Unauthorized - Missing or invalid token
 *       '403':
 *         description: Forbidden - Not an admin account
 *       '500':
 *         description: Server error
 */
router.get('/pending-restaurants', ensureAdmine, adminController.listPendingRestaurants);

/**
 * @openapi
 * /api/admin/banned-restaurants:
 *   get:
 *     summary: List all banned restaurants
 *     description: |
 *       Retrieves all restaurants that are banned (isActive=false).
 *       - Requires admin authentication
 *       - Returns restaurants with isActive=false
 *       - Sorted by update date (newest first)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Banned restaurants retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Banned restaurants retrieved successfully
 *                 restaurants:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       phoneNumber:
 *                         type: string
 *                       emailAddress:
 *                         type: string
 *                         nullable: true
 *                       status:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       isVerified:
 *                         type: boolean
 *                       type:
 *                         type: string
 *                       city:
 *                         type: string
 *                       country:
 *                         type: string
 *                       photoUrl:
 *                         type: string
 *                         nullable: true
 *                       coverUrl:
 *                         type: string
 *                         nullable: true
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       '401':
 *         description: Unauthorized - Missing or invalid token
 *       '403':
 *         description: Forbidden - Not an admin account
 *       '500':
 *         description: Server error
 */
router.get('/banned-restaurants', ensureAdmine, adminController.listBannedRestaurants);

/**
 * @openapi
 * /api/admin/ban-restaurant/{resId}:
 *   put:
 *     summary: Ban a restaurant
 *     description: |
 *       Bans a restaurant by setting isActive to false.
 *       - Requires admin authentication
 *       - Restaurant must exist and not already be banned
 *       - Updates the restaurant's isActive field and audit fields
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the restaurant to ban
 *     responses:
 *       '200':
 *         description: Restaurant banned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Restaurant banned successfully
 *                 restaurant:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                       example: false
 *                     status:
 *                       type: string
 *       '400':
 *         description: Bad request - Restaurant already banned
 *       '401':
 *         description: Unauthorized - Missing or invalid token
 *       '403':
 *         description: Forbidden - Not an admin account
 *       '404':
 *         description: Restaurant not found
 *       '500':
 *         description: Server error
 */
router.put('/ban-restaurant/:resId', ensureAdmine, adminController.banRestaurant);

/**
 * @openapi
 * /api/admin/unban-restaurant/{resId}:
 *   put:
 *     summary: Unban a restaurant
 *     description: |
 *       Unbans a restaurant by setting isActive to true.
 *       - Requires admin authentication
 *       - Restaurant must exist and be currently banned
 *       - Updates the restaurant's isActive field and audit fields
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the restaurant to unban
 *     responses:
 *       '200':
 *         description: Restaurant unbanned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Restaurant unbanned successfully
 *                 restaurant:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     status:
 *                       type: string
 *       '400':
 *         description: Bad request - Restaurant is not banned
 *       '401':
 *         description: Unauthorized - Missing or invalid token
 *       '403':
 *         description: Forbidden - Not an admin account
 *       '404':
 *         description: Restaurant not found
 *       '500':
 *         description: Server error
 */
router.put('/unban-restaurant/:resId', ensureAdmine, adminController.unbanRestaurant);

/**
 * @openapi
 * /api/admin/unban-user/{userId}:
 *   post:
 *     summary: Unban a user
 *     description: |
 *       Unbans a user by setting their status to 'active' and clearing the ban reason.
 *       - Requires admin authentication
 *       - User must be currently banned
 *       - Updates the user's status, banReason, and audit fields
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to unban
 *     responses:
 *       '200':
 *         description: User unbanned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User unbanned successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     phoneNumber:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: active
 *                     banReason:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *       '400':
 *         description: Bad request - User is not banned
 *       '401':
 *         description: Unauthorized - Missing or invalid token
 *       '403':
 *         description: Forbidden - Not an admin account
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Server error
 */
router.post('/unban-user/:userId', ensureAdmine, adminController.unBanUser);

/**
 * @openapi
 * /api/admin/pending-delivery-men:
 *   get:
 *     summary: List all pending delivery men awaiting approval
 *     description: |
 *       Retrieves all delivery men who have registered but are not yet activated.
 *       - Requires admin authentication
 *       - Returns delivery men sorted by registration date (newest first)
 *       - Only shows delivery men with isActive=false and isDeleted=false
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Pending delivery men retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Pending delivery men retrieved successfully
 *                 deliveryMen:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       phoneNumber:
 *                         type: string
 *                       emailAddress:
 *                         type: string
 *                         nullable: true
 *                       pdfPath:
 *                         type: string
 *                         description: Path to uploaded PDF document
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       '401':
 *         description: Unauthorized - Missing or invalid token
 *       '403':
 *         description: Forbidden - Not an admin account
 *       '500':
 *         description: Server error
 */
router.get('/pending-delivery-men', ensureAdmine, adminController.listPendingDeliveryMen);

/**
 * @openapi
 * /api/admin/approve-delivery-man/{deliveryManId}:
 *   post:
 *     summary: Approve a delivery man registration
 *     description: |
 *       Activates a delivery man account by setting isActive to true.
 *       - Requires admin authentication
 *       - Sets isActive=true and status='active'
 *       - After approval, delivery man can login and receive tokens
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deliveryManId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the delivery man to approve
 *     responses:
 *       '200':
 *         description: Delivery man approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Delivery man approved successfully
 *                 deliveryMan:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     phoneNumber:
 *                       type: string
 *                     emailAddress:
 *                       type: string
 *                       nullable: true
 *                     isActive:
 *                       type: boolean
 *                     status:
 *                       type: string
 *       '400':
 *         description: Bad request - Delivery man already approved
 *       '401':
 *         description: Unauthorized - Missing or invalid token
 *       '403':
 *         description: Forbidden - Not an admin account
 *       '404':
 *         description: Delivery man not found
 *       '500':
 *         description: Server error
 */
router.post('/approve-delivery-man/:deliveryManId', ensureAdmine, adminController.approveDeliveryMan);

/**
 * @openapi
 * /api/admin/delivery-men:
 *   get:
 *     summary: List delivery men with filtering and pagination
 *     description: |
 *       Retrieves delivery men with optional search, status, active filter, sorting, and pagination.
 *       - Requires admin authentication
 *       - Supports search by name, phone number, or email address
 *       - Supports filtering by status and isActive flag
 *       - Pagination via page & limit query params
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Search text to match name, phone, or email (case insensitive)
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter drivers by status value (e.g., active, suspended)
 *       - in: query
 *         name: isActive
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Filter by active flag (true/false)
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of records per page (default 20)
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           enum: [createdAt, name]
 *         description: Column to sort by (default createdAt)
 *       - in: query
 *         name: sortOrder
 *         required: false
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort direction (default DESC)
 *     responses:
 *       '200':
 *         description: Drivers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Drivers retrieved successfully
 *                 drivers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       phoneNumber:
 *                         type: string
 *                       emailAddress:
 *                         type: string
 *                         nullable: true
 *                       isActive:
 *                         type: boolean
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       '401':
 *         description: Unauthorized - Missing or invalid token
 *       '403':
 *         description: Forbidden - Not an admin account
 *       '500':
 *         description: Server error
 */
router.get('/delivery-men', ensureAdmine, adminController.getDrivers);

// the following are separeted in the swager 

//this one called cats

/**
 * @openapi
 * /api/admin/res-section/restaurants:
 *   get:
 *     summary: Get restaurants for restaurant section
 *     description: |
 *       Retrieves active, verified restaurants of type 'restaurant'.
 *       - Requires admin authentication
 *       - Supports pagination
 *       - Returns only good restaurants (isActive && isVerified)
 *     tags:
 *       - Admin - Cats Section
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       '200':
 *         description: Restaurants retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '500':
 *         description: Server error
 */
router.get('/res-section/restaurants', ensureAdmine, catsController.getResSectionRestaurants);

/**
 * @openapi
 * /api/admin/res-section/categories:
 *   get:
 *     summary: Get categories for restaurant section
 *     description: |
 *       Retrieves active categories with good products from restaurants of type 'restaurant'.
 *       - Requires admin authentication
 *       - Supports pagination
 *       - Categories must have at least one good product (isActive && forSale)
 *     tags:
 *       - Admin - Cats Section
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       '200':
 *         description: Categories retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '500':
 *         description: Server error
 */
router.get('/res-section/categories', ensureAdmine, catsController.getResSectionCategories);

/**
 * @openapi
 * /api/admin/res-section/products:
 *   get:
 *     summary: Get products for restaurant section
 *     description: |
 *       Retrieves good products from restaurants of type 'restaurant'.
 *       - Requires admin authentication
 *       - Supports pagination
 *       - Returns only good products (isActive && forSale)
 *     tags:
 *       - Admin - Cats Section
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       '200':
 *         description: Products retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '500':
 *         description: Server error
 */
router.get('/res-section/products', ensureAdmine, catsController.getResSectionProducts);

/**
 * @openapi
 * /api/admin/fam-section/restaurants:
 *   get:
 *     summary: Get restaurants for family section
 *     description: |
 *       Retrieves active, verified restaurants of type 'home'.
 *       - Requires admin authentication
 *       - Supports pagination
 *       - Returns only good restaurants (isActive && isVerified)
 *     tags:
 *       - Admin - Cats Section
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       '200':
 *         description: Restaurants retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '500':
 *         description: Server error
 */
router.get('/fam-section/restaurants', ensureAdmine, catsController.getFamSectionRestaurants);

/**
 * @openapi
 * /api/admin/fam-section/categories:
 *   get:
 *     summary: Get categories for family section
 *     description: |
 *       Retrieves active categories with good products from restaurants of type 'home'.
 *       - Requires admin authentication
 *       - Supports pagination
 *       - Categories must have at least one good product (isActive && forSale)
 *     tags:
 *       - Admin - Cats Section
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       '200':
 *         description: Categories retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '500':
 *         description: Server error
 */
router.get('/fam-section/categories', ensureAdmine, catsController.getFamSectionCategories);

/**
 * @openapi
 * /api/admin/fam-section/products:
 *   get:
 *     summary: Get products for family section
 *     description: |
 *       Retrieves good products from restaurants of type 'home'.
 *       - Requires admin authentication
 *       - Supports pagination
 *       - Returns only good products (isActive && forSale)
 *     tags:
 *       - Admin - Cats Section
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       '200':
 *         description: Products retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '500':
 *         description: Server error
 */
router.get('/fam-section/products', ensureAdmine, catsController.getFamSectionProducts);

/**
 * @openapi
 * /api/admin/pless-section/restaurants:
 *   get:
 *     summary: Get restaurants for plessing section
 *     description: |
 *       Retrieves active, verified restaurants (types 'home' or 'restaurant') that have plessing offers.
 *       - Requires admin authentication
 *       - Supports pagination
 *       - Returns only restaurants with active plessing offers
 *     tags:
 *       - Admin - Cats Section
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       '200':
 *         description: Restaurants retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '500':
 *         description: Server error
 */
router.get('/pless-section/restaurants', ensureAdmine, catsController.getPlessSectionRestaurants);

/**
 * @openapi
 * /api/admin/pless-section/categories:
 *   get:
 *     summary: Get categories for plessing section
 *     description: |
 *       Retrieves active categories with products that have plessing offers.
 *       - Requires admin authentication
 *       - Supports pagination
 *       - Categories must have products with active plessing offers (isPleassing && endDate > now)
 *     tags:
 *       - Admin - Cats Section
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       '200':
 *         description: Categories retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '500':
 *         description: Server error
 */
router.get('/pless-section/categories', ensureAdmine, catsController.getPlessSectionCategories);

/**
 * @openapi
 * /api/admin/pless-section/products:
 *   get:
 *     summary: Get products for plessing section
 *     description: |
 *       Retrieves good products with active plessing offers.
 *       - Requires admin authentication
 *       - Supports pagination
 *       - Returns products with active plessing offers (isPleassing && endDate > now)
 *     tags:
 *       - Admin - Cats Section
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       '200':
 *         description: Products retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '500':
 *         description: Server error
 */
router.get('/pless-section/products', ensureAdmine, catsController.getPlessSectionProducts);

/**
 * @openapi
 * /api/admin/delivery-man/{deliveryManId}/verify:
 *   post:
 *     summary: Verify a delivery man
 *     description: Sets isVerified to true for a delivery man (from isActive=true, isVerified=false to isActive=true, isVerified=true)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deliveryManId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Delivery man verified successfully
 *       '400':
 *         description: Delivery man is already verified
 *       '404':
 *         description: Delivery man not found
 *       '500':
 *         description: Server error
 */
router.post('/delivery-man/:deliveryManId/verify', ensureAdmine, adminController.verifyDeliveryMan);

/**
 * @openapi
 * /api/admin/delivery-man/{deliveryManId}/ban:
 *   post:
 *     summary: Ban a delivery man
 *     description: Sets isActive to false for a delivery man
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deliveryManId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Delivery man banned successfully
 *       '400':
 *         description: Delivery man is already banned
 *       '404':
 *         description: Delivery man not found
 *       '500':
 *         description: Server error
 */
router.post('/delivery-man/:deliveryManId/ban', ensureAdmine, adminController.banDeliveryMan);

/**
 * @openapi
 * /api/admin/delivery-man/{deliveryManId}/unban:
 *   post:
 *     summary: Unban a delivery man
 *     description: Sets isActive to true for a delivery man
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deliveryManId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Delivery man unbanned successfully
 *       '400':
 *         description: Delivery man is not banned
 *       '404':
 *         description: Delivery man not found
 *       '500':
 *         description: Server error
 */
router.post('/delivery-man/:deliveryManId/unban', ensureAdmine, adminController.unbanDeliveryMan);

/**
 * @openapi
 * /api/admin/delivery-men/banned:
 *   get:
 *     summary: List all banned delivery men
 *     description: Retrieves all delivery men where isActive is false
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Banned delivery men retrieved successfully
 *       '500':
 *         description: Server error
 */
router.get('/delivery-men/banned', ensureAdmine, adminController.listBannedDeliveryMen);

module.exports = router;
