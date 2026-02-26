const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile');
const { ensureActive } = require('../validaters');

/**
 * @openapi
 * tags:
 *   - name: Profile
 *     description: Manage user profiles (Customer, Restaurant, Delivery Man)
 */

/**
 * @openapi
 * /api/profile/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     description: Retrieves the profile of the authenticated user (customer, restaurant, or delivery man). The password field is excluded from the response.
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID (must match authenticated user)
 *     responses:
 *       '200':
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   description: Customer profile
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     phoneNumber:
 *                       type: string
 *                     emailAddress:
 *                       type: string
 *                     emailVerified:
 *                       type: boolean
 *                     isActive:
 *                       type: boolean
 *                     lastLogin:
 *                       type: string
 *                       format: date-time
 *                     status:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 - type: object
 *                   description: Restaurant profile
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     emailAddress:
 *                       type: string
 *                     phoneNumber:
 *                       type: string
 *                     slug:
 *                       type: string
 *                     deliveryDistanceKm:
 *                       type: number
 *                     latitude:
 *                       type: number
 *                     longitude:
 *                       type: number
 *                     city:
 *                       type: string
 *                     country:
 *                       type: string
 *                     isVerified:
 *                       type: boolean
 *                     type:
 *                       type: string
 *                     description:
 *                       type: string
 *                     status:
 *                       type: string
 *                 - type: object
 *                   description: Delivery man profile
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     phoneNumber:
 *                       type: string
 *                     rate:
 *                       type: number
 *                     deliveredOrders:
 *                       type: integer
 *                     status:
 *                       type: string
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Server error
 */
router.get ('/:id', ensureActive, profileController.getProfile);
/**
 * @openapi
 * /api/profile/{id}:
 *   post:
 *     summary: Update user profile
 *     description: Updates the profile of the authenticated user. For customers, updates the name field. For restaurants and delivery men, the implementation saves without changes (placeholder for future updates).
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID (must match authenticated user)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name (for customers)
 *     responses:
 *       '200':
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   description: Updated customer profile
 *                 - type: object
 *                   description: Updated restaurant profile
 *                 - type: object
 *                   description: Updated delivery man profile
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Server error
 */
router.post('/:id', ensureActive, profileController.updateProfile);

/**
 * @openapi
 * /api/profile/customer/update:
 *   put:
 *     summary: Update customer account information
 *     description: |
 *       Allows authenticated customers to update their account information including name, email address, and password.
 *       **Phone number cannot be updated through this endpoint.**
 *       
 *       **Features:**
 *       - Update name (max 120 characters)
 *       - Update or clear email address (validates format and uniqueness)
 *       - Change password (requires current password verification)
 *       - At least one field must be provided
 *       - Email verification is reset when email is changed
 *       
 *       **Security:**
 *       - Requires authentication token
 *       - Current password required for password changes
 *       - Email uniqueness validation
 *       - Account must be active
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Customer's full name (max 120 characters)
 *                 example: John Doe
 *               emailAddress:
 *                 type: string
 *                 format: email
 *                 description: Customer's email address (max 160 characters). Set to null or empty string to clear.
 *                 example: john.doe@example.com
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: Current password (required only when changing password)
 *                 example: oldPassword123
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: New password (min 6 characters, requires currentPassword)
 *                 example: newPassword456
 *           examples:
 *             updateName:
 *               summary: Update name only
 *               value:
 *                 name: John Smith
 *             updateEmail:
 *               summary: Update email only
 *               value:
 *                 emailAddress: newemail@example.com
 *             updatePassword:
 *               summary: Change password
 *               value:
 *                 currentPassword: oldPassword123
 *                 newPassword: newSecurePassword456
 *             updateAll:
 *               summary: Update all fields
 *               value:
 *                 name: John Smith
 *                 emailAddress: john.smith@example.com
 *                 currentPassword: oldPassword123
 *                 newPassword: newPassword456
 *             clearEmail:
 *               summary: Clear email address
 *               value:
 *                 emailAddress: null
 *     responses:
 *       '200':
 *         description: Customer information updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Customer information updated successfully
 *                 customer:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: John Smith
 *                     phoneNumber:
 *                       type: string
 *                       example: "+201234567890"
 *                       description: Phone number (read-only, cannot be updated)
 *                     emailAddress:
 *                       type: string
 *                       example: john.smith@example.com
 *                     emailVerified:
 *                       type: boolean
 *                       example: false
 *                       description: Reset to false when email is changed
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     status:
 *                       type: string
 *                       example: active
 *                     lastLogin:
 *                       type: string
 *                       format: date-time
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *             examples:
 *               success:
 *                 summary: Successful update
 *                 value:
 *                   message: Customer information updated successfully
 *                   customer:
 *                     id: 1
 *                     name: John Smith
 *                     phoneNumber: "+201234567890"
 *                     emailAddress: john.smith@example.com
 *                     emailVerified: false
 *                     isActive: true
 *                     status: active
 *                     lastLogin: "2026-01-10T14:30:00.000Z"
 *                     createdAt: "2026-01-01T10:00:00.000Z"
 *                     updatedAt: "2026-01-10T14:30:00.000Z"
 *       '400':
 *         description: Validation error or bad request
 *         content:
 *           application/json:
 *             examples:
 *               noFields:
 *                 summary: No fields provided
 *                 value:
 *                   message: At least one field must be provided for update (name, emailAddress, or newPassword)
 *               invalidEmail:
 *                 summary: Invalid email format
 *                 value:
 *                   message: Invalid email address format
 *               emailInUse:
 *                 summary: Email already exists
 *                 value:
 *                   message: Email address is already in use
 *               nameTooLong:
 *                 summary: Name exceeds limit
 *                 value:
 *                   message: Name must not exceed 120 characters
 *               passwordTooShort:
 *                 summary: Password too short
 *                 value:
 *                   message: New password must be at least 6 characters long
 *               wrongPassword:
 *                 summary: Current password incorrect
 *                 value:
 *                   message: Current password is incorrect
 *               missingCurrentPassword:
 *                 summary: Current password required
 *                 value:
 *                   message: Current password is required to set a new password
 *       '401':
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       '403':
 *         description: Forbidden - Account is not active
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Account is not active
 *       '404':
 *         description: Customer not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Customer not found
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
 *                 error:
 *                   type: string
 */
router.put('/customer/update', ensureActive, profileController.updateCustomerInfo);


module.exports  =  router;