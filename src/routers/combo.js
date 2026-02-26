const express = require('express');
const router = express.Router();
const comboController = require('../controllers/combo')
const {ensureActive} = require('../validaters')
const { imageUpload } = require('../middleware/imageUpload');

/**
 * @openapi
 * tags:
 *   - name: Combos
 *     description: Manage restaurant combo deals
 */

/**
 * @openapi
 * /api/combo/mine/{res_id}/{combo_id}:
 *   get:
 *     summary: Retrieve a specific combo for the authenticated restaurant
 *     tags:
 *       - Combos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: res_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant identifier (must match authenticated user)
 *       - in: path
 *         name: combo_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Combo identifier
 *     responses:
 *       '200':
 *         description: Combo details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 combo:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     restaurantId:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                       format: float
 *                     status:
 *                       type: string
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
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           itemId:
 *                             type: integer
 *                           quantity:
 *                             type: integer
 *                           product:
 *                             type: object
 *                             properties:
 *                               productId:
 *                                 type: integer
 *                               name:
 *                                 type: string
 *                               status:
 *                                 type: string
 *                               isActive:
 *                                 type: boolean
 *                               salePrice:
 *                                 type: number
 *                                 format: float
 *                               photoURL:
 *                                 type: string
 *       '401':
 *         description: Unauthorized (missing or invalid bearer token)
 *       '403':
 *         description: Forbidden when requesting combos for another restaurant
 *       '404':
 *         description: Combo not found
 *       '500':
 *         description: Server error
 */
router.get('/mine/:res_id/:combo_id',ensureActive,comboController.Detail)

/**
 * @openapi
 * /api/combo/mine/{res_id}:
 *   get:
 *     summary: List combos for the authenticated restaurant
 *     tags:
 *       - Combos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: res_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant identifier (must match authenticated user)
 *     responses:
 *       '200':
 *         description: Combos fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 combos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       price:
 *                         type: number
 *                         format: float
 *                       status:
 *                         type: string
 *                       restaurantId:
 *                         type: integer
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                       expireDate:
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
 *       '401':
 *         description: Unauthorized (missing or invalid bearer token)
 *       '403':
 *         description: Forbidden when requesting combos for another restaurant
 *       '500':
 *         description: Server error
 */
router.get('/mine/:res_id',ensureActive,comboController.getMine)

/**
 * @openapi
 * /api/combo/{res_id}/{combo_id}:
 *   get:
 *     summary: Retrieve a single combo with its items
 *     tags:
 *       - Combos
 *     parameters:
 *       - in: path
 *         name: res_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant identifier
 *       - in: path
 *         name: combo_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Combo identifier
 *     responses:
 *       '200':
 *         description: Combo details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 combo:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     restaurantId:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                       format: float
 *                     status:
 *                       type: string
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
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           itemId:
 *                             type: integer
 *                           quantity:
 *                             type: integer
 *                           product:
 *                             type: object
 *                             properties:
 *                               productId:
 *                                 type: integer
 *                               name:
 *                                 type: string
 *                               status:
 *                                 type: string
 *                               isActive:
 *                                 type: boolean
 *                               salePrice:
 *                                 type: number
 *                                 format: float
 *                               photoURL:
 *                                 type: string
 *       '404':
 *         description: Combo not found
 *       '500':
 *         description: Server error
 */
router.get('/:res_id/:combo_id',comboController.Detail)

/**
 * @openapi
 * /api/combo/{res_id}:
 *   get:
 *     summary: List active combos for a restaurant (public)
 *     tags:
 *       - Combos
 *     parameters:
 *       - in: path
 *         name: res_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant identifier
 *     responses:
 *       '200':
 *         description: Active combos fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 combos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       price:
 *                         type: number
 *                         format: float
 *                       photoURL:
 *                         type: string
 *       '500':
 *         description: Server error
 */
router.get('/:res_id',comboController.getCombo)

/**
 * @openapi
 * /api/combo/create/{res_id}:
 *   post:
 *     summary: Create a new combo for the authenticated restaurant
 *     description: Creates a combo with optional photo upload. Photo is stored locally in resources/images/.
 *     tags:
 *       - Combos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: res_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant identifier
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *               - name
 *               - price
 *               - addedProducts
 *             properties:
 *               restaurantId:
 *                 type: integer
 *                 description: Must match the authenticated restaurant id
 *               name:
 *                 type: string
 *                 maxLength: 160
 *               description:
 *                 type: string
 *                 maxLength: 160
 *               price:
 *                 type: number
 *                 minimum: 0
 *               addedProducts:
 *                 type: array
 *                 description: Each entry must include `productId` and `quantity`
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *               isActive:
 *                 type: boolean
 *                 description: Optional flag to activate the combo (will be forced to false if any product is inactive)
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Optional combo photo (jpeg, jpg, png, gif, webp). Max 5MB.
 *     responses:
 *       '201':
 *         description: Combo created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Combo created successfully
 *                 combo:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     restaurantId:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                       format: float
 *                     photoUrl:
 *                       type: string
 *                       nullable: true
 *                       description: Photo URL from database
 *                     status:
 *                       type: string
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
 *       '400':
 *         description: Validation error (missing fields, invalid price, or invalid products payload)
 *       '401':
 *         description: Unauthorized (token missing or restaurant mismatch)
 *       '404':
 *         description: One or more products not found or inactive
 *       '500':
 *         description: Server error
 */
router.post('/create/:res_id',ensureActive,imageUpload.single('photo'),comboController.create)

/**
 * @openapi
 * /api/combo/update/{res_id}/{combo_id}:
 *   post:
 *     summary: Update an existing combo
 *     description: Updates combo details with optional photo upload. Uploading a new photo will delete the old one.
 *     tags:
 *       - Combos
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
 *         name: combo_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Combo identifier
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *               - name
 *               - price
 *               - addedProducts
 *             properties:
 *               restaurantId:
 *                 type: integer
 *                 description: Must match the authenticated restaurant id
 *               name:
 *                 type: string
 *                 maxLength: 160
 *               description:
 *                 type: string
 *                 maxLength: 160
 *               price:
 *                 type: number
 *                 minimum: 0
 *               addedProducts:
 *                 type: array
 *                 description: Desired set of products for the combo
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *               isActive:
 *                 type: boolean
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Optional new combo photo (jpeg, jpg, png, gif, webp). Max 5MB. Replaces existing photo.
 *     responses:
 *       '201':
 *         description: Combo updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Combo updated successfully
 *                 combo:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     restaurantId:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                       format: float
 *                     photoUrl:
 *                       type: string
 *                       nullable: true
 *                       description: Photo URL from database
 *                     status:
 *                       type: string
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
 *       '400':
 *         description: Validation error (missing fields, invalid price, or invalid products payload)
 *       '401':
 *         description: Unauthorized (token missing or restaurant mismatch)
 *       '404':
 *         description: Combo not found or one or more products not found
 *       '500':
 *         description: Server error
 */
router.post('/update/:res_id/:combo_id',ensureActive,imageUpload.single('photo'),comboController.update)

/**
 * @openapi
 * /api/combo/delete/{res_id}/{combo_id}:
 *   post:
 *     summary: Soft delete a combo and all of its items
 *     tags:
 *       - Combos
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
 *         name: combo_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Combo identifier to delete
 *     responses:
 *       '200':
 *         description: Combo deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Combo deleted successfully
 *       '401':
 *         description: Unauthorized (missing or invalid bearer token)
 *       '404':
 *         description: Combo not found
 *       '500':
 *         description: Server error
 */
router.post('/delete/:res_id/:combo_id',ensureActive,comboController.deletee)

/**
 * @openapi
 * /api/combo/activate/{res_id}/{combo_id}:
 *   post:
 *     summary: Activate a combo (only if all products are active)
 *     tags:
 *       - Combos
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
 *         name: combo_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Combo identifier to activate
 *     responses:
 *       '200':
 *         description: Combo activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Combo activated successfully
 *       '400':
 *         description: Cannot activate the combo because it has no products or contains inactive products
 *       '404':
 *         description: Combo not found
 *       '500':
 *         description: Server error
 */
router.post('/activate/:res_id/:combo_id',ensureActive,comboController.activate)

/**
 * @openapi
 * /api/combo/deactivate/{res_id}/{combo_id}:
 *   post:
 *     summary: Deactivate a combo and all of its items
 *     tags:
 *       - Combos
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
 *         name: combo_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Combo identifier to deactivate
 *     responses:
 *       '200':
 *         description: Combo deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Combo deactivated successfully
 *       '401':
 *         description: Unauthorized (missing or invalid bearer token)
 *       '404':
 *         description: Combo not found
 *       '500':
 *         description: Server error
 */
router.post('/deactivate/:res_id/:combo_id',ensureActive,comboController.deactivate)


module.exports = router