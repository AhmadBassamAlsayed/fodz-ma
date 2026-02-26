const express = require('express');
const router = express.Router();
const cattegoryController= require('../controllers/category')
const {ensureActive} = require('../validaters')
const { imageUpload } = require('../middleware/imageUpload');

/**
 * @openapi
 * tags:
 *   - name: Categories
 *     description: Manage restaurant categories
 */

/**
 * @openapi
 * /api/category/create:
 *   post:
 *     summary: Create a new category for the authenticated restaurant
 *     description: Creates a category with optional photo upload. Photo is stored locally in resources/images/.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *               - name
 *             properties:
 *               restaurantId:
 *                 type: integer
 *                 description: Must match the authenticated restaurant id
 *               name:
 *                 type: string
 *                 maxLength: 120
 *               shortName:
 *                 type: string
 *                 maxLength: 60
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, pending, deleted, deactivated]
 *                 description: When set to `active`, `isActive` will be true
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Optional category photo (jpeg, jpg, png, gif, webp). Max 5MB.
 *     responses:
 *       '201':
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Category created successfully
 *                 photoUrl:
 *                   type: string
 *                   nullable: true
 *                   description: Photo URL from database (null if no photo uploaded)
 *       '400':
 *         description: Validation error
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.post('/create',ensureActive,imageUpload.single('photo'),cattegoryController.createCategory);

/**
 * @openapi
 * /api/category/delete/{cat_id}:
 *   post:
 *     summary: Soft delete a category and all its products
 *     description: Soft deletes the category by setting `isActive` to false and `status` to 'deleted'. Also cascades the deletion to all products in this category.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cat_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifier of the category to delete
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
 *                 description: Must match the authenticated restaurant id
 *     responses:
 *       '200':
 *         description: Category and all its products deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Category deleted successfully
 *       '400':
 *         description: Invalid identifier
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Category not found
 *       '500':
 *         description: Server error
 */
router.post('/delete/:cat_id',ensureActive,cattegoryController.deletee)

/**
 * @openapi
 * /api/category/update/{cat_id}:
 *   post:
 *     summary: Update an existing category
 *     description: Updates category details with optional photo upload. Uploading a new photo will delete the old one.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cat_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *             properties:
 *               restaurantId:
 *                 type: integer
 *                 description: Must match the authenticated restaurant id
 *               name:
 *                 type: string
 *               shortName:
 *                 type: string
 *               description:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Optional new category photo (jpeg, jpg, png, gif, webp). Max 5MB. Replaces existing photo.
 *     responses:
 *       '200':
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Category updated successfully
 *                 photoUrl:
 *                   type: string
 *                   nullable: true
 *                   description: Photo URL from database
 *       '400':
 *         description: Invalid payload or identifier
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Category not found
 *       '500':
 *         description: Server error
 */
router.post('/update/:cat_id',ensureActive,imageUpload.single('photo'),cattegoryController.updatee)

/**
 * @openapi
 * /api/category/activate/{cat_id}:
 *   post:
 *     summary: Activate a category and all its products
 *     description: Activates the category by setting `isActive` to true and `status` to 'active'. Also cascades the activation to all products in this category.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cat_id
 *         required: true
 *         schema:
 *           type: integer
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
 *                 description: Must match the authenticated restaurant id
 *     responses:
 *       '200':
 *         description: Category and all its products activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Category activated successfully
 *       '400':
 *         description: Invalid identifier
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Category not found
 *       '500':
 *         description: Server error
 */
router.post('/activate/:cat_id',ensureActive,cattegoryController.activate)

/**
 * @openapi
 * /api/category/deactivate/{cat_id}:
 *   post:
 *     summary: Deactivate a category and all its products
 *     description: Deactivates the category by setting `isActive` to false and `status` to 'deactivated'. Also cascades the deactivation to all products in this category.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cat_id
 *         required: true
 *         schema:
 *           type: integer
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
 *                 description: Must match the authenticated restaurant id
 *     responses:
 *       '200':
 *         description: Category and all its products deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Category deactivated successfully
 *       '400':
 *         description: Invalid identifier
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Category not found
 *       '500':
 *         description: Server error
 */
router.post('/deactivate/:cat_id',ensureActive,cattegoryController.deActivate)

/**
 * @openapi
 * /api/category/restore/{cat_id}:
 *   post:
 *     summary: Restore a soft-deleted category and all its products
 *     description: Restores the category by setting `isActive` to true and `status` to 'active'. Also cascades the restoration to all products in this category.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cat_id
 *         required: true
 *         schema:
 *           type: integer
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
 *                 description: Must match the authenticated restaurant id
 *     responses:
 *       '200':
 *         description: Category and all its products restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Category restored successfully
 *       '400':
 *         description: Invalid identifier
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Category not found
 *       '500':
 *         description: Server error
 */
router.post('/restore/:cat_id',ensureActive,cattegoryController.restore)

/**
 * @openapi
 * /api/category/mine:
 *   get:
 *     summary: List categories belonging to the authenticated restaurant
 *     description: Returns all non-deleted categories for the authenticated restaurant, including a count of non-deleted products in each category.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Categories fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Categories fetched successfully
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       shortName:
 *                         type: string
 *                       description:
 *                         type: string
 *                       status:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       restaurantId:
 *                         type: integer
 *                       productsCount:
 *                         type: integer
 *                         description: Count of non-deleted products in this category
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.get('/mine',ensureActive,cattegoryController.getmine) //photoooo

/**
 * @openapi
 * /api/category/deleted/{res_id}:
 *   get:
 *     summary: List soft-deleted categories for the authenticated restaurant
 *     description: Returns all deleted categories for the authenticated restaurant, including a count of deleted products in each category.
 *     tags:
 *       - Categories
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
 *         description: Categories fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Categories fetched successfully
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       shortName:
 *                         type: string
 *                       description:
 *                         type: string
 *                       status:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       restaurantId:
 *                         type: integer
 *                       deletedProductsCount:
 *                         type: integer
 *                         description: Count of deleted products in this category
 *       '400':
 *         description: Invalid restaurant identifier
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.get('/deleted/:res_id',ensureActive,cattegoryController.getDeleted)//photoooo

/**
 * @openapi
 * /api/category/{res_id}:
 *   get:
 *     summary: List active categories for a restaurant
 *     description: Returns all active categories for the specified restaurant. This endpoint is public and does not require authentication.
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: res_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant identifier
 *     responses:
 *       '200':
 *         description: Categories fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Categories fetched successfully
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       shortName:
 *                         type: string
 *                       description:
 *                         type: string
 *                       status:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       restaurantId:
 *                         type: integer
 *       '400':
 *         description: Invalid restaurant identifier
 *       '500':
 *         description: Server error
 */
router.get('/:res_id',cattegoryController.getCategories)

module.exports = router;
