const express = require('express');
const router = express.Router();
const restaurantsController = require('../controllers/restaurants');
const {userTogle, ensureAdmine } = require('../validaters');
const { imageUpload } = require('../middleware/imageUpload');


/**
 * @openapi
 * /api/restaurants:
 *   get:
 *     summary: List all active restaurants
 *     description: |
 *       Fetches all active restaurants with their categories, average rating, and ratings count.
 *       Each restaurant is decorated with static `photoURL` and `coverURL` fields.
 *       Results are ordered by average rating in descending order.
 *     tags:
 *       - Restaurants
 *     responses:
 *       '200':
 *         description: Restaurants fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: restaurants fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Restaurant unique identifier
 *                       name:
 *                         type: string
 *                         description: Restaurant name
 *                       description:
 *                         type: string
 *                         description: Restaurant description
 *                       average_rating:
 *                         type: number
 *                         format: float
 *                         description: Average rating from all reviews (0 if no ratings)
 *                       ratings_count:
 *                         type: integer
 *                         description: Total number of ratings received
 *                       photoURL:
 *                         type: string
 *                         description: Restaurant photo URL
 *                       coverURL:
 *                         type: string
 *                         description: Restaurant cover image URL
 *                       categories:
 *                         type: array
 *                         description: List of categories offered by the restaurant
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *       '404':
 *         description: No restaurants found
 *       '500':
 *         description: Server error
 */
router.get('/',userTogle,restaurantsController.listAll);
/**
 * @openapi
 * /api/restaurants/activate/{res_id}:
 *   post:
 *     summary: Activate a restaurant
 *     description: |
 *       Changes the status of a restaurant to "active" by its unique identifier.
 *       The restaurant must exist in the database.
 *     tags:
 *       - Restaurants
 *     parameters:
 *       - in: path
 *         name: res_id
 *         description: Restaurant unique identifier (must be a valid integer)
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Restaurant activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Restaurant activated successfully
 *       '400':
 *         description: Invalid restaurant identifier supplied
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
*/
router.post('/activate/:res_id',restaurantsController.activate)

/**
 * @openapi
 * /api/restaurants/detailes/{resId}:
 *   get:
 *     summary: Get restaurant details
 *     description: |
 *       Fetches detailed information about a specific restaurant including name, description, 
 *       categories, average rating, ratings count, photo URL, and cover URL.
 *     tags:
 *       - Restaurants
 *     parameters:
 *       - in: path
 *         name: resId
 *         description: Restaurant unique identifier
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Restaurant details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Restaurant details fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: Restaurant unique identifier
 *                     name:
 *                       type: string
 *                       description: Restaurant name
 *                     description:
 *                       type: string
 *                       description: Restaurant description
 *                     photoUrl:
 *                       type: string
 *                       nullable: true
 *                       description: Restaurant photo URL
 *                     coverUrl:
 *                       type: string
 *                       nullable: true
 *                       description: Restaurant cover image URL
 *                     averageRating:
 *                       type: string
 *                       description: Average rating (formatted to 2 decimal places)
 *                       example: "4.50"
 *                     ratingsCount:
 *                       type: integer
 *                       description: Total number of ratings
 *                       example: 25
 *                     categories:
 *                       type: array
 *                       description: List of categories offered by the restaurant
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
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
 */
router.get('/detailes/:resId',restaurantsController.detailes)

router.get('/pending',ensureAdmine,restaurantsController.getPending);

/**
 * @openapi
 * /api/restaurants/{restaurantId}/images:
 *   put:
 *     summary: Update restaurant images
 *     description: |
 *       Updates the photo and/or cover image for a restaurant.
 *       - At least one image (photo or cover) must be provided
 *       - Old images are automatically deleted when replaced
 *       - Supports multipart/form-data with fields: photo, cover
 *       - Maximum file size: 5MB per image
 *       - Allowed formats: jpeg, jpg, png, gif, webp
 *       - Requires admin authentication
 *     tags:
 *       - Restaurants
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Restaurant photo image file
 *               cover:
 *                 type: string
 *                 format: binary
 *                 description: Restaurant cover image file
 *     responses:
 *       '200':
 *         description: Restaurant images updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Restaurant images updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     photoUrl:
 *                       type: string
 *                       example: http://localhost:2801/resources/images/photo-1234567890-123456789.jpg
 *                     coverUrl:
 *                       type: string
 *                       example: http://localhost:2801/resources/images/cover-1234567890-123456789.jpg
 *       '400':
 *         description: Bad request - Missing restaurant ID or no images provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: At least one image (photo or cover) is required
 *       '401':
 *         description: Unauthorized - Invalid or missing authentication token
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
 */
router.put('/:restaurantId/images', ensureAdmine, imageUpload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
]), restaurantsController.updateImages);

module.exports = router