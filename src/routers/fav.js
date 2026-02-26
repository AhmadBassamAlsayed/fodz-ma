const express = require('express');
const router = express.Router();
const favController = require('../controllers/fav');
const ensureActive = require('../validaters').ensureActive;
/**
 * @openapi
 * tags:
 *   - name: Favorites
 *     description: Manage customer favorite products
 */

/**
 * @openapi
 * /api/fav/{id}:
 *   get:
 *     summary: Get all favorite products for a customer
 *     description: Retrieves all active favorite products for the authenticated customer. Only returns products that are active, for sale, and not deleted.
 *     tags:
 *       - Favorites
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer ID (must match authenticated user)
 *     responses:
 *       '200':
 *         description: Favorites retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Favorites retrieved successfully
 *                 favorites:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Favorite record ID
 *                       product:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           salePrice:
 *                             type: number
 *                             format: decimal
 *                           categoryId:
 *                             type: integer
 *                           restaurantId:
 *                             type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       '403':
 *         description: Unauthorized - Customer ID does not match authenticated user
 *       '500':
 *         description: Server error
 */
router.get('/:id', ensureActive, favController.getFav);

/**
 * @openapi
 * /api/fav/add/{id}:
 *   post:
 *     summary: Add a product to customer favorites
 *     description: Adds a product to the authenticated customer's favorites. If the product was previously removed from favorites, it will be reactivated.
 *     tags:
 *       - Favorites
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID to add to favorites
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *             properties:
 *               customerId:
 *                 type: integer
 *                 description: Must match the authenticated customer ID
 *     responses:
 *       '201':
 *         description: Product added to favorites successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product added to favorites successfully
 *       '200':
 *         description: Product reactivated in favorites (was previously removed)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product added to favorites successfully
 *       '400':
 *         description: Product is already in favorites
 *       '403':
 *         description: Unauthorized - Customer ID does not match authenticated user
 *       '404':
 *         description: Customer or product not found, or product is not for sale
 *       '500':
 *         description: Server error
 */
router.post('/add/:id', ensureActive, favController.addFav);

/**
 * @openapi
 * /api/fav/remove/{id}:
 *   post:
 *     summary: Remove a product from customer favorites
 *     description: Soft deletes a product from the authenticated customer's favorites by setting `isActive` to false and `status` to 'removed'.
 *     tags:
 *       - Favorites
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID to remove from favorites
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *             properties:
 *               customerId:
 *                 type: integer
 *                 description: Must match the authenticated customer ID
 *     responses:
 *       '200':
 *         description: Product removed from favorites successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product removed from favorites successfully
 *       '403':
 *         description: Unauthorized - Customer ID does not match authenticated user
 *       '404':
 *         description: Favorite not found
 *       '500':
 *         description: Server error
 */
router.post('/remove/:id', ensureActive, favController.deleteFav);

module.exports = router;