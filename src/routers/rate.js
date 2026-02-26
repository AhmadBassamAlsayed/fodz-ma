const express = require('express');
const router = express.Router();
const rateController = require('../controllers/rate');
const {ensureActive} = require('../validaters')

/**
 * @openapi
 * /api/rate:
 *   get:
 *     summary: Get customer rating for a restaurant or product
 *     description: Retrieves the rating given by a customer for either a restaurant or a product. Returns 0 if no rating exists.
 *     tags:
 *       - Ratings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the customer who gave the rating
 *       - in: query
 *         name: resId
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID of the restaurant (required if productId is not provided)
 *       - in: query
 *         name: productId
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID of the product (required if resId is not provided)
 *     responses:
 *       200:
 *         description: Rating retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rate:
 *                   type: integer
 *                   description: Rating value (0-5, where 0 means no rating exists)
 *                   example: 4
 *       400:
 *         description: Bad request - missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "customerId is required"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
router.get('/',ensureActive, rateController.getRate);

/**
 * @openapi
 * /api/rate:
 *   post:
 *     summary: Create or update a customer rating for a restaurant or product
 *     description: Allows a customer to rate a restaurant or product. If a rating already exists, it will be updated. Rating must be between 1 and 5.
 *     tags:
 *       - Ratings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - rating
 *             properties:
 *               customerId:
 *                 type: integer
 *                 description: ID of the customer giving the rating
 *                 example: 123
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating value (1-5)
 *                 example: 4
 *               restaurantId:
 *                 type: integer
 *                 description: ID of the restaurant to rate (required if productId is not provided)
 *                 example: 45
 *               productId:
 *                 type: integer
 *                 description: ID of the product to rate (required if restaurantId is not provided)
 *                 example: 78
 *     responses:
 *       200:
 *         description: Rating updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product rating updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID of the rating record
 *                       example: 1
 *                     rating:
 *                       type: integer
 *                       description: The rating value
 *                       example: 4
 *       201:
 *         description: Rating created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product rating created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID of the rating record
 *                       example: 1
 *                     rating:
 *                       type: integer
 *                       description: The rating value
 *                       example: 4
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "rating must be between 1 and 5"
 *       404:
 *         description: Restaurant or product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
router.post('/',ensureActive, rateController.createOrUpdateRate);

module.exports = router;
