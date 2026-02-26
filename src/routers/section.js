const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/section');
const { ensureAdmine } = require('../validaters');

/**
 * @openapi
 * tags:
 *   - name: Sections
 *     description: Manage sections and their associated items
 */

/**
 * @openapi
 * /api/section:
 *   get:
 *     summary: List all sections with their associated items
 *     tags:
 *       - Sections
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Sections fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sections:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       screen:
 *                         type: string
 *                       type:
 *                         type: string
 *                       name:
 *                         type: string
 *                       isDeleted:
 *                         type: boolean
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
 *                       items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             sectionId:
 *                               type: integer
 *                             restaurantId:
 *                               type: integer
 *                               nullable: true
 *                             famId:
 *                               type: integer
 *                               nullable: true
 *                             productId:
 *                               type: integer
 *                               nullable: true
 *                             restaurant:
 *                               type: object
 *                               nullable: true
 *                             familyRestaurant:
 *                               type: object
 *                               nullable: true
 *                             product:
 *                               type: object
 *                               nullable: true
 *       '401':
 *         description: Unauthorized (missing or invalid bearer token)
 *       '403':
 *         description: Forbidden (not an admin account)
 *       '500':
 *         description: Server error
 */
router.get('/', ensureAdmine, sectionController.list);

/**
 * @openapi
 * /api/section/{id}:
 *   get:
 *     summary: Retrieve a single section with its associated items
 *     tags:
 *       - Sections
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Section identifier
 *     responses:
 *       '200':
 *         description: Section fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 section:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     screen:
 *                       type: string
 *                     type:
 *                       type: string
 *                     name:
 *                       type: string
 *                     isDeleted:
 *                       type: boolean
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
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           sectionId:
 *                             type: integer
 *                           restaurantId:
 *                             type: integer
 *                             nullable: true
 *                           famId:
 *                             type: integer
 *                             nullable: true
 *                           productId:
 *                             type: integer
 *                             nullable: true
 *                           restaurant:
 *                             type: object
 *                             nullable: true
 *                           familyRestaurant:
 *                             type: object
 *                             nullable: true
 *                           product:
 *                             type: object
 *                             nullable: true
 *       '401':
 *         description: Unauthorized (missing or invalid bearer token)
 *       '403':
 *         description: Forbidden (not an admin account)
 *       '404':
 *         description: Section not found
 *       '500':
 *         description: Server error
 */
router.get('/:id', ensureAdmine, sectionController.getOne);

/**
 * @openapi
 * /api/section:
 *   post:
 *     summary: Create a new section with associated items
 *     description: Creates a section and automatically creates sectionItems based on the type field. If type is 'fam', creates items with famId. If type is 'restaurant', creates items with restaurantId. If type is 'product', creates items with productId.
 *     tags:
 *       - Sections
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               screen:
 *                 type: string
 *                 maxLength: 120
 *                 description: Screen identifier
 *               type:
 *                 type: string
 *                 maxLength: 120
 *                 description: Type of items (fam, restaurant, or product)
 *                 enum: [fam, restaurant, product]
 *               name:
 *                 type: string
 *                 maxLength: 120
 *                 description: Section name
 *               ids:
 *                 type: array
 *                 description: Array of IDs to create sectionItems for
 *                 items:
 *                   type: integer
 *     responses:
 *       '201':
 *         description: Section created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Section created successfully
 *                 section:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     screen:
 *                       type: string
 *                     type:
 *                       type: string
 *                     name:
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
 *         description: Validation error (ids must be an array)
 *       '401':
 *         description: Unauthorized (missing or invalid bearer token)
 *       '403':
 *         description: Forbidden (not an admin account)
 *       '500':
 *         description: Server error
 */
router.post('/', ensureAdmine, sectionController.create);

/**
 * @openapi
 * /api/section/{id}:
 *   put:
 *     summary: Update an existing section and replace its items
 *     description: Updates section details and replaces all associated sectionItems within a transaction. All existing items are deleted and new ones are created based on the provided ids array.
 *     tags:
 *       - Sections
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Section identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               screen:
 *                 type: string
 *                 maxLength: 120
 *                 description: Screen identifier
 *               type:
 *                 type: string
 *                 maxLength: 120
 *                 description: Type of items (fam, restaurant, or product)
 *                 enum: [fam, restaurant, product]
 *               name:
 *                 type: string
 *                 maxLength: 120
 *                 description: Section name
 *               ids:
 *                 type: array
 *                 description: Array of IDs to create sectionItems for (replaces all existing items)
 *                 items:
 *                   type: integer
 *     responses:
 *       '200':
 *         description: Section updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Section updated successfully
 *                 section:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     screen:
 *                       type: string
 *                     type:
 *                       type: string
 *                     name:
 *                       type: string
 *                     updatedBy:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       '400':
 *         description: Validation error (ids must be an array)
 *       '401':
 *         description: Unauthorized (missing or invalid bearer token)
 *       '403':
 *         description: Forbidden (not an admin account)
 *       '404':
 *         description: Section not found
 *       '500':
 *         description: Server error
 */
router.put('/:id', ensureAdmine, sectionController.update);

/**
 * @openapi
 * /api/section/{id}:
 *   delete:
 *     summary: Soft delete a section and all its associated items
 *     description: Sets isDeleted flag to true for both the section and all its sectionItems within a transaction
 *     tags:
 *       - Sections
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Section identifier to delete
 *     responses:
 *       '200':
 *         description: Section deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Section deleted successfully
 *       '401':
 *         description: Unauthorized (missing or invalid bearer token)
 *       '403':
 *         description: Forbidden (not an admin account)
 *       '404':
 *         description: Section not found
 *       '500':
 *         description: Server error
 */
router.delete('/:id', ensureAdmine, sectionController.deletee);



module.exports = router;
