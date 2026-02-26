const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address');
const { ensureActive } = require('../validaters');

/**
 * @openapi
 * tags:
 *   - name: Addresses
 *     description: Manage customer addresses
 */

/**
 * @openapi
 * /api/address/create:
 *   post:
 *     summary: Create a new address for the authenticated customer or restaurant
 *     tags:
 *       - Addresses
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - longitude
 *               - latitude
 *               - city
 *               - country
 *               - street
 *               - notes
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 description: Address name
 *               longitude:
 *                 type: number
 *                 format: decimal
 *                 description: Longitude coordinate
 *               latitude:
 *                 type: number
 *                 format: decimal
 *                 description: Latitude coordinate
 *               city:
 *                 type: string
 *                 description: City name
 *               country:
 *                 type: string
 *                 description: Country name
 *               street:
 *                 type: string
 *                 description: Street address
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *               type:
 *                 type: string
 *                 enum: [customer, restaurant]
 *                 description: Address type - must match user role (customer creates customer addresses, restaurant creates restaurant addresses)
 *     responses:
 *       '201':
 *         description: Address created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Address created successfully
 *                 address:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     city:
 *                       type: string
 *                     country:
 *                       type: string
 *       '400':
 *         description: Validation error
 *       '403':
 *         description: Forbidden - type does not match user role
 *       '500':
 *         description: Server error
 */
router.post('/create', ensureActive, addressController.createAddress);

/**
 * @openapi
 * /api/address/set-default/{address_id}:
 *   post:
 *     summary: Set an address as the default address
 *     description: Sets the specified address as the default address for the authenticated customer. All other addresses for the same customer will be set to non-default (isDefault = false). Uses a database transaction to ensure atomicity.
 *     tags:
 *       - Addresses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: address_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifier of the address to set as default
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
 *                 description: Must match the authenticated customer id
 *     responses:
 *       '200':
 *         description: Default address updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Default address updated successfully
 *                 address:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     isDefault:
 *                       type: boolean
 *                       example: true
 *       '400':
 *         description: Invalid address identifier
 *       '401':
 *         description: Unauthorized - customerId does not match authenticated user
 *       '404':
 *         description: Address not found or address is deleted/inactive
 *       '500':
 *         description: Server error
 */
router.post('/set-default/:address_id', ensureActive, addressController.setDefaultAddress);

/**
 * @openapi
 * /api/address/delete/{address_id}:
 *   post:
 *     summary: Soft delete an address
 *     description: Soft deletes the address by setting `isActive` to false and `status` to 'deleted'.
 *     tags:
 *       - Addresses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: address_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifier of the address to delete
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
 *                 description: Must match the authenticated customer id
 *     responses:
 *       '200':
 *         description: Address deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Address deleted successfully
 *       '400':
 *         description: Invalid identifier
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Address not found
 *       '500':
 *         description: Server error
 */
router.post('/delete/:address_id', ensureActive, addressController.deleteAddress);

/**
 * @openapi
 * /api/address/update/{address_id}:
 *   post:
 *     summary: Update an existing address
 *     tags:
 *       - Addresses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: address_id
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
 *               - customerId
 *             properties:
 *               customerId:
 *                 type: integer
 *                 description: Must match the authenticated customer id
 *               name:
 *                 type: string
 *               streetAddress:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               street:
 *                 type: string
 *               stateRegion:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *               phone:
 *                 type: string
 *               notes:
 *                 type: string
 *               type:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       '200':
 *         description: Address updated successfully
 *       '400':
 *         description: Invalid payload or identifier
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Address not found
 *       '500':
 *         description: Server error
 */
router.post('/update/:address_id', ensureActive, addressController.updateAddress);

/**
 * @openapi
 * /api/address/mine:
 *   get:
 *     summary: List addresses belonging to the authenticated customer or restaurant
 *     description: Returns all non-deleted addresses for the authenticated user.
 *     tags:
 *       - Addresses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Addresses fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Addresses fetched successfully
 *                 addresses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       city:
 *                         type: string
 *                       country:
 *                         type: string
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.get('/mine', ensureActive, addressController.getAddresses);

module.exports = router;