const express = require('express');
const router = express.Router();
const homeAdsController = require('../controllers/homeAds');
const { ensureAdmine } = require('../validaters');

const { imageUpload } = require('../middleware/imageUpload');

/**
 * @openapi
 * /api/home-ads/all:
 *   get:
 *     summary: Get all home ads
 *     description: Retrieves all active home ads with restaurant information
 *     tags:
 *       - Home Ads
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Home ads fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Home ads fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       resId:
 *                         type: integer
 *                         example: 5
 *                       photoUrl:
 *                         type: string
 *                         example: "https://example.com/ad.jpg"
 *                       restaurant:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           photoUrl:
 *                             type: string
 *                           coverUrl:
 *                             type: string
 *       500:
 *         description: Server error
 */
router.get('/all',ensureAdmine,homeAdsController.all)

/**
 * @openapi
 * /api/home-ads/delete:
 *   delete:
 *     summary: Delete a home ad
 *     description: Soft deletes a home ad by marking it as deleted
 *     tags:
 *       - Home Ads
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the home ad to delete
 *     responses:
 *       200:
 *         description: Home ad deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Home ad deleted successfully"
 *       400:
 *         description: Bad request - missing ad ID
 *       404:
 *         description: Home ad not found
 *       500:
 *         description: Server error
 */
router.delete('/delete',ensureAdmine,homeAdsController.deleteOne)

/**
 * @openapi
 * /api/home-ads/create:
 *   post:
 *     summary: Create a new home ad
 *     description: Creates a new home ad with an image for a restaurant
 *     tags:
 *       - Home Ads
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - resId
 *             properties:
 *               resId:
 *                 type: integer
 *                 description: ID of the restaurant
 *                 example: 5
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Ad image file
 *     responses:
 *       201:
 *         description: Home ad created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Home ad created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     resId:
 *                       type: integer
 *                     photoUrl:
 *                       type: string
 *       400:
 *         description: Bad request - missing restaurant ID
 *       404:
 *         description: Restaurant not found
 *       500:
 *         description: Server error
 */
router.post('/create',ensureAdmine,imageUpload.single('image'),homeAdsController.create)


// const upload = require('../middleware/upload');

module.exports = router;
