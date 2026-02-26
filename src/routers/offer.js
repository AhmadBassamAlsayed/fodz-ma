const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offer')
const {ensureActive,ensureRestaurant} = require('../validaters')

/**
 * @openapi
 * tags:
 *   - name: Offers
 *     description: Manage restaurant product offers and discounts
 *   - name: Plessing
 *     description: Manage plessing offers (limited-time offers with quantity)
 */

/**
 * @openapi
 * /api/offer/plessing:
 *   post:
 *     summary: Create a new plessing (limited-time offer with quantity)
 *     description: Creates a plessing offer with required quantity, start date, end date, and plessing price. A plessing is a special offer where isPleassing=true.
 *     tags:
 *       - Plessing
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - plessingPrice
 *               - quantity
 *               - startDate
 *               - endDate
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: Product ID to apply the plessing to
 *               plessingPrice:
 *                 type: number
 *                 format: float
 *                 description: Special plessing price (must be greater than 0)
 *               quantity:
 *                 type: integer
 *                 description: Available quantity for the plessing (must be greater than 0)
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Plessing start date and time (required)
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: Plessing end date and time (required, must be after startDate)
 *     responses:
 *       '201':
 *         description: Plessing created successfully
 *       '400':
 *         description: Invalid data
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Product not found
 *       '500':
 *         description: Server error
 */
router.post('/plessing',ensureRestaurant,offerController.createPlessing)

/**
 * @openapi
 * /api/offer/plessing/{plessing_id}:
 *   put:
 *     summary: Update an existing plessing
 *     tags:
 *       - Plessing
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: plessing_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Plessing updated successfully
 *       '400':
 *         description: Invalid data
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Plessing or product not found
 *       '500':
 *         description: Server error
 */
router.put('/plessing/:plessing_id',ensureRestaurant,offerController.updatePlessing)

/**
 * @openapi
 * /api/offer/plessing/{res_id}/{plessing_id}:
 *   get:
 *     summary: Get detailed information about a specific plessing
 *     tags:
 *       - Plessing
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: res_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: plessing_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Plessing details fetched successfully
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Plessing not found
 *       '500':
 *         description: Server error
 */
router.get('/plessing/:res_id/:plessing_id',ensureRestaurant,offerController.plessingDetails)

/**
 * @openapi
 * /api/offer/plessing/{res_id}:
 *   get:
 *     summary: List all active plessings for a restaurant (public endpoint)
 *     tags:
 *       - Plessing
 *     parameters:
 *       - in: path
 *         name: res_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Plessings fetched successfully
 *       '500':
 *         description: Server error
 */
router.get('/plessing/:res_id',offerController.listPlessing)

/**
 * @openapi
 * /api/offer/plessing/{plessing_id}:
 *   delete:
 *     summary: Deactivate a plessing (soft delete)
 *     tags:
 *       - Plessing
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: plessing_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Plessing deactivated successfully
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Plessing not found
 *       '500':
 *         description: Server error
 */
router.delete('/plessing/:plessing_id',ensureRestaurant,offerController.deactivatePlessing)

/**
 * @openapi
 * /api/offer/mine/{type}/{res_id}:
 *   get:
 *     summary: Get all offers for the authenticated restaurant by type
 *     tags:
 *       - Offers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [percentage, amount]
 *         description: Type of offer (percentage or amount discount)
 *       - in: path
 *         name: res_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant identifier (must match authenticated user)
 *     responses:
 *       '200':
 *         description: Offers fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 offers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       productId:
 *                         type: integer
 *                       type:
 *                         type: string
 *                         enum: [percentage, amount]
 *                       amount:
 *                         type: number
 *                         format: float
 *                       percentage:
 *                         type: number
 *                         format: float
 *                       status:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                       createdBy:
 *                         type: string
 *                       updatedBy:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       photoURL:
 *                         type: string
 *                       product:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           salePrice:
 *                             type: number
 *                             format: float
 *                           isActive:
 *                             type: boolean
 *                           status:
 *                             type: string
 *       '401':
 *         description: Unauthorized (missing or invalid bearer token)
 *       '403':
 *         description: Forbidden when requesting offers for another restaurant
 *       '500':
 *         description: Server error
 */
router.get('/mine/:type/:res_id',ensureActive,offerController.getMine)

/**
 * @openapi
 * /api/offer/{type}/{res_id}/{offer_id}:
 *   get:
 *     summary: Get detailed information about a specific offer
 *     tags:
 *       - Offers
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [percentage, amount]
 *         description: Type of offer
 *       - in: path
 *         name: res_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant identifier
 *       - in: path
 *         name: offer_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Offer identifier
 *     responses:
 *       '200':
 *         description: Offer details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 offer:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     productId:
 *                       type: integer
 *                     type:
 *                       type: string
 *                       enum: [percentage, amount]
 *                     amount:
 *                       type: number
 *                       format: float
 *                     percentage:
 *                       type: number
 *                       format: float
 *                     status:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                     createdBy:
 *                       type: string
 *                     updatedBy:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     photoURL:
 *                       type: string
 *                     product:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         salePrice:
 *                           type: number
 *                           format: float
 *                         isActive:
 *                           type: boolean
 *                         status:
 *                           type: string
 *       '404':
 *         description: Offer not found
 *       '500':
 *         description: Server error
 */
router.get('/:type/:res_id/:offer_id',offerController.Detail)

/**
 * @openapi
 * /api/offer/{type}/{res_id}:
 *   get:
 *     summary: Get all active offers for a restaurant by type (public endpoint)
 *     tags:
 *       - Offers
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [percentage, amount]
 *         description: Type of offer
 *       - in: path
 *         name: res_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant identifier
 *     responses:
 *       '200':
 *         description: Active offers fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 offers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       productId:
 *                         type: integer
 *                       type:
 *                         type: string
 *                       amount:
 *                         type: number
 *                         format: float
 *                       percentage:
 *                         type: number
 *                         format: float
 *                       photoURL:
 *                         type: string
 *                       product:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           salePrice:
 *                             type: number
 *                             format: float
 *                           isActive:
 *                             type: boolean
 *                           status:
 *                             type: string
 *       '500':
 *         description: Server error
 */
router.get('/:type/:res_id',offerController.getoffers)

/**
 * @openapi
 * /api/offer/create/{type}/{res_id}:
 *   post:
 *     summary: Create a new offer for a product
 *     tags:
 *       - Offers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [percentage, amount]
 *         description: Type of offer to create
 *       - in: path
 *         name: res_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - productId
 *               - status
 *             properties:
 *               name:
 *                 type: string
 *                 description: Offer name
 *               productId:
 *                 type: integer
 *                 description: Product ID to apply the offer to
 *               amount:
 *                 type: number
 *                 description: Discount amount (required if type is 'amount')
 *               percentage:
 *                 type: number
 *                 description: Discount percentage (required if type is 'percentage')
 *               status:
 *                 type: string
 *                 enum: [active, deactivated]
 *                 description: Initial status of the offer
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Offer start date (optional)
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: Offer end date (optional, must be after startDate)
 *     responses:
 *       '201':
 *         description: Offer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Offer created successfully
 *                 offer:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     productId:
 *                       type: integer
 *                     type:
 *                       type: string
 *                     amount:
 *                       type: number
 *                       format: float
 *                     percentage:
 *                       type: number
 *                       format: float
 *                     status:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                     createdBy:
 *                       type: string
 *                     updatedBy:
 *                       type: string
 *       '400':
 *         description: Invalid data (missing required fields or invalid date range)
 *       '401':
 *         description: Unauthorized (missing or invalid bearer token)
 *       '403':
 *         description: Forbidden (restaurant ID mismatch)
 *       '404':
 *         description: Product not found
 *       '500':
 *         description: Server error
 */
router.post('/create/:type/:res_id',ensureRestaurant,offerController.create)

/**
 * @openapi
 * /api/offer/update/{res_id}/{offer_id}:
 *   post:
 *     summary: Update an existing offer
 *     tags:
 *       - Offers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: res_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant identifier
 *       - in: path
 *         name: offer_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Offer identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated offer name
 *               productId:
 *                 type: integer
 *                 description: Updated product ID
 *               amount:
 *                 type: number
 *                 description: Updated discount amount
 *               percentage:
 *                 type: number
 *                 description: Updated discount percentage
 *               status:
 *                 type: string
 *                 enum: [active, deactivated, deleted]
 *                 description: Updated status
 *               type:
 *                 type: string
 *                 enum: [percentage, amount]
 *                 description: Updated offer type
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Updated start date
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: Updated end date
 *     responses:
 *       '200':
 *         description: Offer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Offer updated successfully
 *       '400':
 *         description: Invalid data
 *       '401':
 *         description: Unauthorized (missing or invalid bearer token)
 *       '403':
 *         description: Forbidden (restaurant ID mismatch)
 *       '404':
 *         description: Offer or product not found
 *       '500':
 *         description: Server error
 */
router.post('/update/:res_id/:offer_id',ensureRestaurant,offerController.update)

/**
 * @openapi
 * /api/offer/delete/{res_id}/{offer_id}:
 *   post:
 *     summary: Soft delete an offer
 *     tags:
 *       - Offers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: res_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant identifier
 *       - in: path
 *         name: offer_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Offer identifier to delete
 *     responses:
 *       '200':
 *         description: Offer deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Offer deleted successfully
 *       '401':
 *         description: Unauthorized (missing or invalid bearer token)
 *       '403':
 *         description: Forbidden (restaurant ID mismatch)
 *       '404':
 *         description: Offer not found
 *       '500':
 *         description: Server error
 */
router.post('/delete/:res_id/:offer_id',ensureRestaurant,offerController.deletee)

/**
 * @openapi
 * /api/offer/activate/{res_id}/{offer_id}:
 *   post:
 *     summary: Activate a deactivated offer
 *     tags:
 *       - Offers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: res_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant identifier
 *       - in: path
 *         name: offer_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Offer identifier to activate
 *     responses:
 *       '200':
 *         description: Offer activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Offer activated successfully
 *       '401':
 *         description: Unauthorized (missing or invalid bearer token)
 *       '403':
 *         description: Forbidden (restaurant ID mismatch)
 *       '404':
 *         description: Offer not found or not in deactivated status
 *       '500':
 *         description: Server error
 */
router.post('/activate/:res_id/:offer_id',ensureRestaurant,offerController.activate)

/**
 * @openapi
 * /api/offer/deactivate/{res_id}/{offer_id}:
 *   post:
 *     summary: Deactivate an active offer
 *     tags:
 *       - Offers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: res_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant identifier
 *       - in: path
 *         name: offer_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Offer identifier to deactivate
 *     responses:
 *       '200':
 *         description: Offer deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Offer deactivated successfully
 *       '401':
 *         description: Unauthorized (missing or invalid bearer token)
 *       '403':
 *         description: Forbidden (restaurant ID mismatch)
 *       '404':
 *         description: Offer not found or not in active status
 *       '500':
 *         description: Server error
 */
router.post('/deactivate/:res_id/:offer_id',ensureRestaurant,offerController.deactivate)

module.exports = router;