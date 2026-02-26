const express = require('express');
const router = express.Router();
const productController = require('../controllers/product')
const {ensureActive,userTogle} = require('../validaters')
const { imageUpload } = require('../middleware/imageUpload');


/**
 * @openapi
 * /api/product/mine/deleted/{res_id}/{cat_id}:
 *   get:
 *     summary: List deleted products for the authenticated restaurant
 *     description: Retrieves all products owned by the authenticated restaurant that are marked as deleted.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: res_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifier of the authenticated restaurant. Must match the authenticated user.
 *       - in: path
 *         name: cat_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifier of the category containing the deleted products.
 *     responses:
 *       '200':
 *         description: Deleted products fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Products fetched successfully
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       '400':
 *         description: Invalid path parameter provided
 *       '401':
 *         description: Unauthorized restaurant access
 *       '404':
 *         description: No deleted products found for the restaurant
 *       '500':
 *         description: Server error
 */
router.get('/mine/deleted/:res_id/:cat_id',ensureActive,productController.getMineDeleted)

/**
 * @openapi
 * /api/product/mine/{res_id}/{cat_id}:
 *   get:
 *     summary: List active products for the authenticated restaurant
 *     description: Retrieves all non-deleted products owned by the authenticated restaurant.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: res_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifier of the authenticated restaurant. Must match the authenticated user.
 *       - in: path
 *         name: cat_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifier of the category (currently reserved for future filtering logic).
 *     responses:
 *       '200':
 *         description: Products fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Products fetched successfully
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       '400':
 *         description: Invalid path parameter provided
 *       '401':
 *         description: Unauthorized restaurant access
 *       '404':
 *         description: No active products found for the restaurant
 *       '500':
 *         description: Server error
 */
router.get('/mine/:res_id/:cat_id',ensureActive,productController.getMine)

/**
 * @openapi
 * /api/product/create/{cat_id}:
 *   post:
 *     summary: Create a new product within a category
 *     description: Creates a product owned by the authenticated restaurant for the specified category. Optionally attach addons and upload a photo during creation.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cat_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifier of the category that will own the product.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *               - name
 *               - description
 *               - salePrice
 *               - forSale
 *             properties:
 *               restaurantId:
 *                 type: integer
 *                 description: Identifier of the authenticated restaurant. Must match the authenticated user.
 *               name:
 *                 type: string
 *                 maxLength: 160
 *               description:
 *                 type: string
 *               salePrice:
 *                 type: number
 *                 format: float
 *               forSale:
 *                 type: boolean
 *                 description: Whether the product is for sale or not.
 *               prepTimeMinutes:
 *                 type: integer
 *                 minimum: 0
 *               addons:
 *                 type: array
 *                 description: Optional array of addon IDs to attach to the product. All addons must belong to the same restaurant and be active.
 *                 items:
 *                   type: integer
 *                   minimum: 1
 *                 example: [1, 3, 5]
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Optional product photo (jpeg, jpg, png, gif, webp). Max 5MB. Stored locally in resources/images/.
 *     responses:
 *       '201':
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product created successfully
 *                 productId:
 *                   type: integer
 *                   description: ID of the created product
 *                 attachedAddonIds:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   description: Array of addon IDs that were attached
 *                 photoUrl:
 *                   type: string
 *                   nullable: true
 *                   description: URL/path of the uploaded photo (null if no photo uploaded)
 *       '400':
 *         description: Invalid request payload or parameters (e.g., addons not an array, invalid addon IDs)
 *       '401':
 *         description: Authentication failed or restaurant mismatch
 *       '404':
 *         description: Category not found or one or more addons not found for this restaurant
 *       '500':
 *         description: Server error
 */
router.post('/create/:cat_id',ensureActive,imageUpload.single('photo'),productController.createProduct)

/**
 * @openapi
 * /api/product/update/{product_id}:
 *   post:
 *     summary: Update an existing product
 *     description: Updates product details for the authenticated restaurant. Optionally update addon attachments and photo. Omit addons to leave attachments unchanged, send empty array to remove all, or send new IDs to replace. Uploading a new photo will delete the old one.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifier of the product to update.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *               - name
 *               - description
 *               - salePrice
 *             properties:
 *               restaurantId:
 *                 type: integer
 *                 description: Identifier of the authenticated restaurant. Must match the authenticated user.
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               salePrice:
 *                 type: number
 *                 format: float
 *               prepTimeMinutes:
 *                 type: integer
 *                 minimum: 0
 *               addons:
 *                 type: array
 *                 description: Optional array of addon IDs to attach. Omit to leave unchanged, send [] to remove all, or send IDs to replace. All addons must belong to the same restaurant and be active.
 *                 items:
 *                   type: integer
 *                   minimum: 1
 *                 example: [2, 4, 6]
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Optional new product photo (jpeg, jpg, png, gif, webp). Max 5MB. Replaces existing photo if present.
 *     responses:
 *       '200':
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product updated successfully
 *                 productId:
 *                   type: integer
 *                   description: ID of the updated product
 *                 attachedAddonIds:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   description: Array of addon IDs currently attached (only present if addons were updated)
 *                 photoUrl:
 *                   type: string
 *                   nullable: true
 *                   description: URL/path of the product photo
 *       '400':
 *         description: Invalid payload or identifier (e.g., addons not an array, invalid addon IDs)
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Product not found or one or more addons not found for this restaurant
 *       '500':
 *         description: Server error
 */
router.post('/update/:product_id',ensureActive,imageUpload.single('photo'),productController.updateProduct)

/**
 * @openapi
 * /api/product/delete/{product_id}:
 *   post:
 *     summary: Soft delete a product
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifier of the product to delete.
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
 *                 description: Identifier of the authenticated restaurant. Must match the authenticated user.
 *     responses:
 *       '200':
 *         description: Product deleted successfully
 *       '400':
 *         description: Invalid product identifier
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Product not found
 *       '500':
 *         description: Server error
 */
router.post('/delete/:product_id',ensureActive,productController.deleteProduct)

/**
 * @openapi
 * /api/product/restore/{product_id}:
 *   post:
 *     summary: Restore a previously deleted product
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifier of the product to restore.
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
 *                 description: Identifier of the authenticated restaurant. Must match the authenticated user.
 *     responses:
 *       '200':
 *         description: Product restored successfully
 *       '400':
 *         description: Invalid product identifier
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Product not found
 *       '500':
 *         description: Server error
 */
router.post('/restore/:product_id',ensureActive,productController.restoreProduct)

/**
 * @openapi
 * /api/product/deactivate/{product_id}:
 *   post:
 *     summary: Deactivate a product
 *     description: Marks the product as inactive without deleting it.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifier of the product to deactivate.
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
 *                 description: Identifier of the authenticated restaurant. Must match the authenticated user.
 *     responses:
 *       '200':
 *         description: Product deactivated successfully
 *       '400':
 *         description: Invalid product identifier
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Product not found
 *       '500':
 *         description: Server error
 */
router.post('/deactivate/:product_id',ensureActive,productController.deactivateProduct)

/**
 * @openapi
 * /api/product/activate/{product_id}:
 *   post:
 *     summary: Activate a product
 *     description: Re-activates a product so it becomes available again.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifier of the product to activate.
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
 *                 description: Identifier of the authenticated restaurant. Must match the authenticated user.
 *     responses:
 *       '200':
 *         description: Product activated successfully
 *       '400':
 *         description: Invalid product identifier
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Product not found
 *       '500':
 *         description: Server error
 */
router.post('/activate/:product_id',ensureActive,productController.activateProduct)

/**
 * @openapi
 * /api/product/hide/{product_id}:
 *   post:
 *     summary: Hide a product
 *     description: Marks an active product as hidden while keeping it available for the owning restaurant to manage.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifier of the product to hide.
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
 *                 description: Identifier of the authenticated restaurant. Must match the authenticated user.

 *     responses:
 *       '200':
 *         description: Product hidden successfully
 *       '400':
 *         description: Invalid product identifier
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Product not found
 *       '500':
 *         description: Server error
 */
router.post('/hide/:product_id',ensureActive,productController.hideProduct)

/**
 * @openapi
 * /api/product/unhide/{product_id}:
 *   post:
 *     summary: Unhide a product
 *     description: Restores a hidden product to active status, making it visible again in listings.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifier of the product to unhide.
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
 *                 description: Identifier of the authenticated restaurant. Must match the authenticated user.

 *     responses:
 *       '200':
 *         description: Product unhidden successfully
 *       '400':
 *         description: Invalid product identifier
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Product not found
 *       '500':
 *         description: Server error
 */
router.post('/unhide/:product_id',ensureActive,productController.unhideProduct)

/**
 * @openapi
 * /api/product/{res_id}/{cat_id}/{product_id}:
 *   get:
 *     summary: Fetch product details by identifiers
 *     description: Retrieves a single product belonging to the specified restaurant and category, including active offers and product addons.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: res_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifier of the restaurant that owns the product.
 *       - in: path
 *         name: cat_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifier of the category to which the product belongs.
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifier of the product to retrieve.
 *       - in: query
 *         name: pless
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Filter offers by isPleassing flag. If true, returns only pleassing offers; if false or omitted, returns non-pleassing offers.
 *     responses:
 *       '200':
 *         description: Product fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product fetched successfully
 *                 Data:
 *                   type: object
 *                   description: Product details including addons and offers
 *       '400':
 *         description: Invalid path parameter provided
 *       '404':
 *         description: Product not found for the given identifiers
 *       '500':
 *         description: Server error
 */
router.get('/:res_id/:cat_id/:product_id',userTogle,productController.detail)

/**
 * @openapi
 * /api/product/{res_id}/{cat_id}:
 *   get:
 *     summary: List active products in a category or all products
 *     description: |
 *       Retrieves all active products for the specified restaurant and category.
 *       - If cat_id > 0: Returns products from that specific category
 *       - If cat_id = 0: Returns all products from the restaurant
 *       - Authentication is optional. If authenticated, the response includes favorite status (isFavorite) for each product.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *       - {}
 *     parameters:
 *       - in: path
 *         name: res_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifier of the restaurant whose products are being requested.
 *       - in: path
 *         name: cat_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifier of the category containing the products. Use 0 to fetch all products from the restaurant.
 *     responses:
 *       '200':
 *         description: Products fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Products fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       categoryId:
 *                         type: integer
 *                         description: Only included when cat_id is 0
 *                       description:
 *                         type: string
 *                       salePrice:
 *                         type: number
 *                       prepTimeMinutes:
 *                         type: integer
 *                       photoURL:
 *                         type: string
 *                       isFavorite:
 *                         type: boolean
 *                         description: Only included when user is authenticated
 *                       offers:
 *                         type: array
 *                         items:
 *                           type: object
 *                           description: Active offers for this product
 *                       favorites:
 *                         type: array
 *                         items:
 *                           type: object
 *                           description: User's favorite records (filtered by authenticated user)
 *       '400':
 *         description: Invalid path parameter provided
 *       '404':
 *         description: No active products found for the given identifiers
 *       '500':
 *         description: Server error
 */
router.get('/:res_id/:cat_id', userTogle , productController.list)

module.exports = router