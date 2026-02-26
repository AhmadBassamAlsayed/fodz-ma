const express = require('express');
const router = express.Router();

const addonController = require('../controllers/addon')
const {ensureRestaurant} = require('../validaters')

/**
 * @swagger
 * /api/addons/create:
 *   post:
 *     summary: Create a new addon for the authenticated restaurant
 *     tags:
 *       - Addons
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *               - name
 *               - salePrice
 *             properties:
 *               restaurantId:
 *                 type: integer
 *                 description: Identifier of the restaurant creating the addon.
 *                 example: 1
 *               name:
 *                 type: string
 *                 description: Display name of the addon.
 *                 example: Extra Cheese
 *               salePrice:
 *                 type: number
 *                 format: float
 *                 description: Sale price of the addon.
 *                 example: 1.5
 *     responses:
 *       201:
 *         description: Addon created successfully.
 *       400:
 *         description: Validation error in the request payload.
 *       401:
 *         description: Unauthorized – restaurant authentication failed.
 *       500:
 *         description: Internal server error.
 */
router.post('/create',ensureRestaurant,addonController.createAddon)

/**
 * @swagger
 * /api/addons/update/{addon_id}:
 *   post:
 *     summary: Update an existing addon that belongs to the authenticated restaurant
 *     tags:
 *       - Addons
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addon_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Identifier of the addon to update.
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *               - name
 *               - salePrice
 *             properties:
 *               restaurantId:
 *                 type: integer
 *                 description: Identifier of the restaurant performing the update.
 *                 example: 1
 *               name:
 *                 type: string
 *                 description: New display name for the addon.
 *                 example: Extra Cheese Large
 *               salePrice:
 *                 type: number
 *                 format: float
 *                 description: Updated sale price of the addon.
 *                 example: 2.0
 *     responses:
 *       201:
 *         description: Addon updated successfully.
 *       400:
 *         description: Validation error (invalid input or identifier).
 *       401:
 *         description: Unauthorized – restaurant authentication failed.
 *       404:
 *         description: Addon not found.
 *       500:
 *         description: Internal server error.
 */
router.post('/update/:addon_id',ensureRestaurant,addonController.updateAddon)

/**
 * @swagger
 * /api/addons/delete/{addon_id}:
 *   post:
 *     summary: Permanently delete an addon owned by the authenticated restaurant
 *     tags:
 *       - Addons
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addon_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Identifier of the addon to delete.
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *             properties:
 *               restaurantId:
 *                 type: integer
 *                 description: Identifier of the restaurant performing the deletion.
 *                 example: 1
 *     responses:
 *       200:
 *         description: Addon deleted successfully.
 *       400:
 *         description: Validation error (invalid identifier or payload).
 *       401:
 *         description: Unauthorized – restaurant authentication failed.
 *       404:
 *         description: Addon not found.
 *       500:
 *         description: Internal server error.
 */
router.post('/delete/:addon_id',ensureRestaurant,addonController.deleteAddon)

/**
 * @swagger
 * /api/addons/attach/{addon_id}/{product_id}:
 *   post:
 *     summary: Attach an addon to a product owned by the authenticated restaurant
 *     tags:
 *       - Addons
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addon_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Identifier of the addon to attach.
 *         example: 1
 *       - in: path
 *         name: product_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Identifier of the product receiving the addon.
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *               - productId
 *               - addonId
 *             properties:
 *               restaurantId:
 *                 type: integer
 *                 description: Identifier of the restaurant performing the attachment.
 *                 example: 1
 *               productId:
 *                 type: integer
 *                 description: Product identifier.
 *                 example: 1
 *               addonId:
 *                 type: integer
 *                 description: Addon identifier.
 *                 example: 1
 *     responses:
 *       201:
 *         description: Addon attached to product successfully.
 *       400:
 *         description: Validation error (invalid identifiers or already attached).
 *       401:
 *         description: Unauthorized – restaurant authentication failed.
 *       404:
 *         description: Product or addon not found.
 *       500:
 *         description: Internal server error.
 */
router.post('/attach/:addon_id/:product_id',ensureRestaurant,addonController.attachAddon)

/**
 * @swagger
 * /api/addons/detach/{addon_id}/{product_id}:
 *   post:
 *     summary: Detach an addon from a product owned by the authenticated restaurant
 *     tags:
 *       - Addons
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addon_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Identifier of the addon to detach.
 *         example: 1
 *       - in: path
 *         name: product_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Identifier of the product currently using the addon.
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *               - productId
 *               - addonId
 *             properties:
 *               restaurantId:
 *                 type: integer
 *                 description: Identifier of the restaurant performing the detachment.
 *                 example: 1
 *               productId:
 *                 type: integer
 *                 description: Product identifier.
 *                 example: 1
 *               addonId:
 *                 type: integer
 *                 description: Addon identifier.
 *                 example: 1
 *     responses:
 *       200:
 *         description: Addon detached from product successfully.
 *       400:
 *         description: Validation error (invalid identifiers or addon not attached).
 *       401:
 *         description: Unauthorized – restaurant authentication failed.
 *       404:
 *         description: Product or addon not found.
 *       500:
 *         description: Internal server error.
 */
router.post('/detach/:addon_id/:product_id',ensureRestaurant,addonController.detachAddon)

/**
 * @swagger
 * /api/addons/list/mine/{res_id}:
 *   get:
 *     summary: Retrieve all non-deleted addons belonging to the authenticated restaurant
 *     tags:
 *       - Addons
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: res_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Identifier of the restaurant whose addons are requested.
 *         example: 1
 *     responses:
 *       200:
 *         description: Addons fetched successfully.
 *       400:
 *         description: Invalid restaurant identifier supplied.
 *       401:
 *         description: Unauthorized – restaurant authentication failed.
 *       500:
 *         description: Internal server error.
 */
router.get('/list/mine/:res_id',ensureRestaurant,addonController.listMine)

/**
 * @swagger
 * /api/addons/list/{res_id}/{cat_id}/{product_id}:
 *   get:
 *     summary: Retrieve active addons attached to a specific product
 *     tags:
 *       - Addons
 *     parameters:
 *       - in: path
 *         name: res_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Identifier of the restaurant that owns the product.
 *         example: 1
 *       - in: path
 *         name: cat_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Identifier of the category that contains the product.
 *         example: 1
 *       - in: path
 *         name: product_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Identifier of the product whose addons are being requested.
 *         example: 1
 *     responses:
 *       200:
 *         description: Addons fetched successfully.
 *       400:
 *         description: Invalid restaurant, category, or product identifier supplied.
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/list/:res_id/:cat_id/:product_id',addonController.list)

module.exports = router;
