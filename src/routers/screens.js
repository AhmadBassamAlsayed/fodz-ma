const express = require('express');
const router = express.Router();
const Screencontroller = require('../controllers/homeScreen');
const {userTogle,ensureActive} = require('../validaters')


/**
 * @openapi
 * /api/screens/home:
 *   get:
 *     summary: Retrieve home screen content
 *     description: Returns curated restaurants, combos, and promotional assets for the consumer home screen.
 *     tags:
 *       - Screens
 *     responses:
 *       '200':
 *         description: Home screen payload returned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 adsPhotos:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: URL of advertisement photo
 *                 returants:
 *                   type: object
 *                   properties:
 *                     normal:
 *                       type: array
 *                       description: List of restaurants
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           average_rating:
 *                             type: number
 *                             format: float
 *                           ratings_count:
 *                             type: integer
 *                           photoUrl:
 *                             type: string
 *                             nullable: true
 *                             description: Restaurant photo URL from database
 *                           coverUrl:
 *                             type: string
 *                             nullable: true
 *                             description: Restaurant cover photo URL from database
 *                           categories:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                 name:
 *                                   type: string
 *                     normalSections:
 *                       type: array
 *                       description: Sections for restaurants screen
 *                       items:
 *                         $ref: '#/components/schemas/Section'
 *                     home:
 *                       type: array
 *                       description: List of home/family restaurants
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           average_rating:
 *                             type: number
 *                             format: float
 *                           ratings_count:
 *                             type: integer
 *                           photoUrl:
 *                             type: string
 *                             nullable: true
 *                             description: Restaurant photo URL from database
 *                           coverUrl:
 *                             type: string
 *                             nullable: true
 *                             description: Restaurant cover photo URL from database
 *                           categories:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                 name:
 *                                   type: string
 *                     homeSections:
 *                       type: array
 *                       description: Sections for family/home screen
 *                       items:
 *                         $ref: '#/components/schemas/Section'
 *                     plessing:
 *                       type: array
 *                       description: List of plessing products
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           photoUrl:
 *                             type: string
 *                             nullable: true
 *                     plessingSections:
 *                       type: array
 *                       description: Sections for plessing screen
 *                       items:
 *                         $ref: '#/components/schemas/Section'
 *       '500':
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *
 * components:
 *   schemas:
 *     Section:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Section display name
 *         type:
 *           type: string
 *           nullable: true
 *           enum: [restaurant, cat, product]
 *           description: Section type determines which fields are populated in items
 *         sectionItemss:
 *           type: array
 *           description: Items in this section with name, description, and IDs
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 nullable: true
 *                 description: Name of the restaurant, category, or product
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: Description of the restaurant, category, or product
 *               resId:
 *                 type: integer
 *                 nullable: true
 *                 description: Restaurant ID (always present for restaurant type, also present for category and product types)
 *               catId:
 *                 type: integer
 *                 nullable: true
 *                 description: Category ID (present when section.type is 'cat' or 'product')
 *               productId:
 *                 type: integer
 *                 nullable: true
 *                 description: Product ID (present when section.type is 'product')
 */
router.get('/home',userTogle,Screencontroller.homeScreen);

/**
 * @openapi
 * /api/screens/serachScreen:
 *   get:
 *     summary: Search screen with top rated items or search results
 *     description: Returns either top 3 rated items (when no search query) or search results (when search query provided) based on the type parameter. Supports restaurant, home, and plessing types.
 *     tags:
 *       - Screens
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [restaurant, home, plessing]
 *         description: Type of search - 'restaurant' for restaurants, 'home' for home/family restaurants, 'plessing' for pleassing products
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Search term to filter results by name. If omitted, returns top 3 rated items based on type.
 *     responses:
 *       '200':
 *         description: Search results returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   description: Response when no search query provided (top rated items)
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Data fetched successfully
 *                     Data:
 *                       type: array
 *                       description: Top 3 rated items based on type
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           photoUrl:
 *                             type: string
 *                             nullable: true
 *                           average_rating:
 *                             type: number
 *                             format: float
 *                             description: Only present for restaurant and home types
 *                 - type: object
 *                   description: Response when search query provided
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Search results fetched successfully
 *                     Data:
 *                       type: object
 *                       properties:
 *                         restaurants:
 *                           type: array
 *                           description: Matching restaurants (limit 5 for restaurant/home types, empty for plessing type)
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               name:
 *                                 type: string
 *                               photoUrl:
 *                                 type: string
 *                                 nullable: true
 *                         products:
 *                           type: array
 *                           description: Matching products with active offers (limit 5 for restaurant/home types, limit 10 for plessing type)
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               name:
 *                                 type: string
 *                               photoUrl:
 *                                 type: string
 *                                 nullable: true
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
 */
router.get('/serachScreen',Screencontroller.serachScreen);

/**
 * @openapi
 * /api/screens/deliveryScreen:
 *   get:
 *     summary: Get available orders for delivery
 *     description: |
 *       Returns all completed orders in the delivery man's city that are ready for pickup and delivery.
 *       - Requires authentication as a verified delivery man
 *       - Returns both restaurant address and delivery address for each order
 *       - Only shows orders in the same city as the delivery man
 *       - Orders are sorted by creation date (newest first)
 *     tags:
 *       - Screens
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Available orders fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Available orders fetched successfully
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 123
 *                       orderNumber:
 *                         type: string
 *                         example: ORD-2024-001
 *                       totalAmount:
 *                         type: number
 *                         format: decimal
 *                         example: 150.50
 *                       shippingAmount:
 *                         type: number
 *                         format: decimal
 *                         example: 20.00
 *                       status:
 *                         type: string
 *                         example: completed
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       deliveryAddress:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           city:
 *                             type: string
 *                           country:
 *                             type: string
 *                           street:
 *                             type: string
 *                           latitude:
 *                             type: number
 *                           longitude:
 *                             type: number
 *                           notes:
 *                             type: string
 *                       restaurantAddress:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           phoneNumber:
 *                             type: string
 *                           city:
 *                             type: string
 *                           country:
 *                             type: string
 *                           street:
 *                             type: string
 *                           latitude:
 *                             type: number
 *                           longitude:
 *                             type: number
 *       '403':
 *         description: Unauthorized - Not a delivery man or not verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Unauthorized: Delivery man only'
 *       '404':
 *         description: Delivery man not found or city not set
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Delivery man not found or city not set'
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
 */
router.get('/deliveryScreen',ensureActive,Screencontroller.deliveryScreen);

/**
 * @openapi
 * /api/screens/deliveryProfile:
 *   get:
 *     summary: Get delivery man profile information
 *     description: |
 *       Returns the authenticated delivery man's profile including statistics and account details.
 *       - Requires authentication as a verified delivery man
 *       - Returns delivered orders count, rating, and other profile information
 *     tags:
 *       - Screens
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Delivery man profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Delivery man profile fetched successfully
 *                 deliveryMan:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     phoneNumber:
 *                       type: string
 *                       example: '+1234567890'
 *                     emailAddress:
 *                       type: string
 *                       nullable: true
 *                       example: john@example.com
 *                     city:
 *                       type: string
 *                       nullable: true
 *                       example: Cairo
 *                     deliveredOrders:
 *                       type: integer
 *                       example: 45
 *                       description: Total number of delivered orders
 *                     rating:
 *                       type: number
 *                       format: decimal
 *                       nullable: true
 *                       example: 4.5
 *                       description: Average rating
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *                     status:
 *                       type: string
 *                       example: active
 *                     memberSince:
 *                       type: string
 *                       format: date-time
 *                       description: Account creation date
 *       '403':
 *         description: Unauthorized - Not a delivery man or not verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Unauthorized: Delivery man only'
 *       '404':
 *         description: Delivery man not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Delivery man not found
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
 */
router.get('/deliveryProfile',ensureActive,Screencontroller.deliveryProfile);

/**
 * @openapi
 * /api/screens/delivery-warnings:
 *   get:
 *     summary: Get warnings for delivery man
 *     description: Retrieves all warnings issued to the authenticated delivery man
 *     tags:
 *       - Screens
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Warnings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Warnings retrieved successfully"
 *                 warnings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       body:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/delivery-warnings', ensureActive, Screencontroller.getDeliveryManWarnings);

module.exports = router;
