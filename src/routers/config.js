const express = require('express');
const router = express.Router();
const configController = require('../controllers/config');
const { ensureAdmine } = require('../validaters');

/**
 * @openapi
 * tags:
 *   - name: Config
 *     description: Manage system configuration
 */

/**
 * @openapi
 * /api/config:
 *   get:
 *     summary: Get all configuration values
 *     tags:
 *       - Config
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Configs fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 configs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       value:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       '500':
 *         description: Server error
 */
router.get('/', ensureAdmine, configController.getAllConfigs);

/**
 * @openapi
 * /api/config:
 *   put:
 *     summary: Update configuration values
 *     tags:
 *       - Config
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - config
 *             properties:
 *               config:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - value
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: The configuration name
 *                     value:
 *                       type: string
 *                       description: The configuration value
 *           example:
 *             config:
 *               - name: "baseKm"
 *                 value: "2"
 *               - name: "basePrice"
 *                 value: "40"
 *               - name: "afterBasePrice"
 *                 value: "25"
 *     responses:
 *       '200':
 *         description: Configs updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 configs:
 *                   type: array
 *                   items:
 *                     type: object
 *       '400':
 *         description: Invalid request format
 *       '404':
 *         description: Config not found
 *       '500':
 *         description: Server error
 */
router.put('/', ensureAdmine, configController.updateConfigs);

/**
 * @openapi
 * /api/config/{config_name}:
 *   get:
 *     summary: Get a specific configuration value by name
 *     tags:
 *       - Config
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: config_name
 *         required: true
 *         schema:
 *           type: string
 *         description: The configuration name
 *     responses:
 *       '200':
 *         description: Config fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 config:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     value:
 *                       type: string
 *       '404':
 *         description: Config not found
 *       '500':
 *         description: Server error
 */
router.get('/:config_name', ensureAdmine, configController.getConfigByName);

/**
 * @openapi
 * /api/config/{config_name}:
 *   put:
 *     summary: Update a specific configuration value by name
 *     tags:
 *       - Config
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: config_name
 *         required: true
 *         schema:
 *           type: string
 *         description: The configuration name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 type: string
 *                 description: The configuration value
 *           example:
 *             value: "50"
 *     responses:
 *       '200':
 *         description: Config updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 config:
 *                   type: object
 *       '400':
 *         description: Invalid request format
 *       '404':
 *         description: Config not found
 *       '500':
 *         description: Server error
 */
router.put('/:config_name', ensureAdmine, configController.updateConfigByName);

module.exports = router;
