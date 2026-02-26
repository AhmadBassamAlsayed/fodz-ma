const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { ensureActive } = require('../validaters');
const { upload } = require('../middleware/upload');
const { imageUpload } = require('../middleware/imageUpload');
/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints for customers, restaurants, and delivery personnel
 */

/**
 * @openapi
 * /api/auth/setfcmtoken:
 *   post:
 *     summary: Set or update FCM token for push notifications
 *     description: |
 *       Updates the Firebase Cloud Messaging (FCM) token for the authenticated user.
 *       - Works for customers, restaurants, and delivery personnel
 *       - Requires authentication (JWT token)
 *       - User must be active (ensureActive middleware)
 *       - Token is used to send push notifications to the user's device
 *       - Can be called on login or when token is refreshed
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fcmToken
 *             properties:
 *               fcmToken:
 *                 type: string
 *                 description: Firebase Cloud Messaging device token
 *                 example: 'dQw4w9WgXcQ:APA91bHun4MxP5egoKMwt2KZFBaFUH-1RYqx...'
 *     responses:
 *       '200':
 *         description: FCM token updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: FCM token updated successfully
 *       '400':
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing required fields
 *       '401':
 *         description: Unauthorized - Invalid or missing JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       '403':
 *         description: Forbidden - User account is not active
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Account is not active
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
router.post('/setfcmtoken',ensureActive,authController.setFcmToken)

/**
 * @openapi
 * /api/auth/cities:
 *   get:
 *     summary: Get list of distinct cities from active restaurants
 *     description: Returns a list of unique city names where active and verified restaurants are located
 *     tags:
 *       - Auth
 *     responses:
 *       '200':
 *         description: Cities fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cities fetched successfully
 *                 cities:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Cairo", "Alexandria", "Giza"]
 *       '500':
 *         description: Server error
 */
router.get('/cities', authController.getCities)

/**
 * @openapi
 * /api/auth/deletee:
 *   post:
 *     summary: Delete account (mock)
 *     description: |
 *       Validates account credentials and returns a success message.
 *       - **Does not** update the database (no delete/soft-delete)
 *       - `type=res` targets Restaurant
 *       - `type=cus` targets Customer
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - phoneNumber
 *               - pass
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [res, cus]
 *                 example: cus
 *               phoneNumber:
 *                 type: string
 *                 example: '+201000000000'
 *               pass:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *     responses:
 *       '200':
 *         description: Account validated successfully
 *       '400':
 *         description: Missing required fields / Invalid type
 *       '404':
 *         description: Wrong credentials
 *       '500':
 *         description: Server error
 */
router.post('/deletee',authController.deletee)

/**
 * @openapi
 * /api/auth/customer/register:
 *   post:
 *     summary: Register a new customer
 *     description: |
 *       Creates a customer account with optional address using a database transaction.
 *       - Required fields: name, phoneNumber, password, address
 *       - Optional fields: emailAddress
 *       - Password is hashed using bcrypt
 *       - Returns JWT token upon success
 *       - Transaction ensures atomic creation of customer and address
 *       - Validates uniqueness of phoneNumber and emailAddress (if provided)
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phoneNumber
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               phoneNumber:
 *                 type: string
 *                 description: Must be unique
 *                 example: '+1234567890'
 *               emailAddress:
 *                 type: string
 *                 format: email
 *                 description: Optional, must be unique if provided
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *               address:
 *                 type: object
 *                 description: Optional address object (required fields must be provided if address is included)
 *                 required:
 *                   - city
 *                   - country
 *                   - street
 *                   - latitude
 *                   - longitude
 *                   - type
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Optional address name/label (defaults to customer name)
 *                     example: Home
 *                   streetAddress:
 *                     type: string
 *                     description: Optional full street address
 *                     example: 123 Main St, Apt 4B
 *                   city:
 *                     type: string
 *                     example: New York
 *                   country:
 *                     type: string
 *                     example: USA
 *                   street:
 *                     type: string
 *                     example: Main Street
 *                   stateRegion:
 *                     type: string
 *                     description: Optional state or region
 *                     example: NY
 *                   phone:
 *                     type: string
 *                     description: Optional phone number (defaults to customer phone)
 *                     example: '+1234567890'
 *                   notes:
 *                     type: string
 *                     description: Optional delivery notes or instructions
 *                     example: Ring doorbell twice
 *                   type:
 *                     type: string
 *                     enum: [customer, restaurant]
 *                     description: Required address type
 *                     example: customer
 *                   latitude:
 *                     type: number
 *                     format: decimal
 *                     example: 40.712776
 *                   longitude:
 *                     type: number
 *                     format: decimal
 *                     example: -74.005974
 *     responses:
 *       '201':
 *         description: Customer registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Customer registered successfully
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 customer:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       nullable: true
 *                     phoneNumber:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     address:
 *                       type: object
 *                       nullable: true
 *                       description: Complete address object if provided during registration
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         streetAddress:
 *                           type: string
 *                           nullable: true
 *                         city:
 *                           type: string
 *                         country:
 *                           type: string
 *                         street:
 *                           type: string
 *                         stateRegion:
 *                           type: string
 *                           nullable: true
 *                         phone:
 *                           type: string
 *                           nullable: true
 *                         notes:
 *                           type: string
 *                         customerId:
 *                           type: integer
 *                         type:
 *                           type: string
 *                           enum: [customer, restaurant]
 *                         latitude:
 *                           type: number
 *                           format: decimal
 *                         longitude:
 *                           type: number
 *                           format: decimal
 *                         isDefault:
 *                           type: boolean
 *                         isActive:
 *                           type: boolean
 *                         status:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing required fields
 *       '500':
 *         description: Server error (transaction rolled back)
 */
router.post('/customer/register', authController.registerCustomer);
/**
 * @openapi
 * /api/auth/customer/login:
 *   post:
 *     summary: Login as a customer
 *     description: |
 *       Authenticates a customer using phone number and password.
 *       - Requires phoneNumber and password
 *       - Account must be active (isActive=true) and not deleted
 *       - Updates lastLogin timestamp on successful login
 *       - Returns JWT token and customer details with default address
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - password
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: Customer phone number
 *                 example: '+1234567890'
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 customer:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       nullable: true
 *                     phoneNumber:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     address:
 *                       type: object
 *                       nullable: true
 *                       description: Complete default address object if exists
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         streetAddress:
 *                           type: string
 *                           nullable: true
 *                         city:
 *                           type: string
 *                         country:
 *                           type: string
 *                         street:
 *                           type: string
 *                         stateRegion:
 *                           type: string
 *                           nullable: true
 *                         phone:
 *                           type: string
 *                           nullable: true
 *                         notes:
 *                           type: string
 *                         customerId:
 *                           type: integer
 *                         type:
 *                           type: string
 *                           enum: [customer, restaurant]
 *                         latitude:
 *                           type: number
 *                           format: decimal
 *                         longitude:
 *                           type: number
 *                           format: decimal
 *                         isDefault:
 *                           type: boolean
 *                         isActive:
 *                           type: boolean
 *                         status:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       '400':
 *         description: Missing credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Username or email and password are required
 *       '401':
 *         description: Invalid credentials or deleted account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 *       '403':
 *         description: Account is not active
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Account is not active
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.post('/customer/login', authController.loginCustomer);

/**
 * @openapi
 * /api/auth/restaurant/register:
 *   post:
 *     summary: Register a new restaurant
 *     description: |
 *       Creates a restaurant account with optional address and images using a database transaction.
 *       - Required fields: name, phoneNumber, password
 *       - Optional fields: emailAddress, type, description, deliveryDistanceKm, address, photo, cover, healthLicense, FCMtoken
 *       - Password is hashed using bcrypt
 *       - Photo, cover, and healthLicense images are uploaded as multipart/form-data and saved as full URLs
 *       - Returns success message only (no token or restaurant data)
 *       - Transaction ensures atomic creation of restaurant and address
 *       - Validates uniqueness of phoneNumber and emailAddress (if provided)
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phoneNumber
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pizza Palace
 *               phoneNumber:
 *                 type: string
 *                 description: Must be unique
 *                 example: '0999999999'
 *               emailAddress:
 *                 type: string
 *                 format: email
 *                 description: Optional, must be unique if provided
 *                 example: info@pizzapalace.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *               type:
 *                 type: string
 *                 description: Restaurant type (e.g., restaurant, home)
 *                 example: restaurant
 *               description:
 *                 type: string
 *                 example: Best pizza in town
 *               deliveryDistanceKm:
 *                 type: number
 *                 format: decimal
 *                 example: 10
 *               FCMtoken:
 *                 type: string
 *                 description: Optional Firebase Cloud Messaging (FCM) device token. Stored in database as fcmToken.
 *                 example: 'dQw4w9WgXcQ:APA91bHun4MxP5egoKMwt2KZFBaFUH-1RYqx...'
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Optional restaurant photo (jpeg, jpg, png, gif, webp, max 5MB)
 *               cover:
 *                 type: string
 *                 format: binary
 *                 description: Optional restaurant cover image (jpeg, jpg, png, gif, webp, max 5MB)
 *               healthLicense:
 *                 type: string
 *                 format: binary
 *                 description: Optional health license document (jpeg, jpg, png, gif, webp, max 5MB)
 *               address:
 *                 type: string
 *                 description: Optional address object as JSON string (notes is optional, other fields required if address is provided)
 *                 example: '{"city":"New York","country":"USA","street":"Main Street","stateRegion":"NY","notes":"Ring doorbell","latitude":40.712776,"longitude":-74.005974,"type":"restaurant"}'
 *     responses:
 *       '201':
 *         description: Restaurant registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Restaurant registered successfully
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing required fields
 *       '500':
 *         description: Server error (transaction rolled back)
 */
router.post('/restaurant/register', imageUpload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
  { name: 'healthLicense', maxCount: 1 }
]), authController.registerRestaurant);
/**
 * @openapi
 * /api/auth/restaurant/login:
 *   post:
 *     summary: Login as a restaurant
 *     description: |
 *       Authenticates a restaurant using phone number and password.
 *       - Requires phoneNumber and password
 *       - Account must be active (isActive=true), verified (isVerified=true), and not deleted
 *       - Returns JWT token with restaurant details and default address
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - password
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: Restaurant phone number
 *                 example: '0999999999'
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 restaurant:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       nullable: true
 *                     phoneNumber:
 *                       type: string
 *                     address:
 *                       type: object
 *                       nullable: true
 *                       description: Complete default address object if exists
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         streetAddress:
 *                           type: string
 *                           nullable: true
 *                         city:
 *                           type: string
 *                         country:
 *                           type: string
 *                         street:
 *                           type: string
 *                         stateRegion:
 *                           type: string
 *                           nullable: true
 *                         phone:
 *                           type: string
 *                           nullable: true
 *                         notes:
 *                           type: string
 *                         restaurantId:
 *                           type: integer
 *                         type:
 *                           type: string
 *                           enum: [customer, restaurant]
 *                         latitude:
 *                           type: number
 *                           format: decimal
 *                         longitude:
 *                           type: number
 *                           format: decimal
 *                         isDefault:
 *                           type: boolean
 *                         isActive:
 *                           type: boolean
 *                         status:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       '400':
 *         description: Missing credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Username or email and password are required
 *       '401':
 *         description: Invalid credentials or deleted account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 *       '403':
 *         description: Account is not active or not verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Account is not verified
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.post('/restaurant/login', authController.loginRestaurant);

/**
 * @openapi
 * /api/auth/deliveryman/register:
 *   post:
 *     summary: Register a new delivery driver
 *     description: |
 *       Creates a delivery driver account with up to 3 PDF document uploads.
 *       - Required fields: name, phoneNumber, password, at least one PDF file, city, pdf2, pdf3
 *       - Optional fields: emailAddress
 *       - Password is hashed using bcrypt
 *       - PDF files are stored in resources/delivery_pdf/
 *       - Default isActive is set to true, isVerified is set to false
 *       - Account requires admin verification before full access
 *       - Returns JWT token upon success
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phoneNumber
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mike Driver
 *               phoneNumber:
 *                 type: string
 *                 description: Must be unique
 *                 example: '+1234567700'
 *               emailAddress:
 *                 type: string
 *                 format: email
 *                 description: Optional, must be unique if provided
 *                 example: mike@example.com
 *               city:
 *                 type: string
 *                 description: Optional delivery driver city
 *                 example: Cairo
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *               pdf1:
 *                 type: string
 *                 format: binary
 *                 description: First PDF document (at least one PDF required, max 10MB)
 *               pdf2:
 *                 type: string
 *                 format: binary
 *                 description: Second PDF document (optional, max 10MB)
 *               pdf3:
 *                 type: string
 *                 format: binary
 *                 description: Third PDF document (optional, max 10MB)
 *     responses:
 *       '201':
 *         description: Delivery driver registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Delivery man registered successfully
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 deliveryMan:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     phoneNumber:
 *                       type: string
 *                     emailAddress:
 *                       type: string
 *                       nullable: true
 *                     city:
 *                       type: string
 *                       nullable: true
 *                     isActive:
 *                       type: boolean
 *                     isVerified:
 *                       type: boolean
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing required fields or PDF file is required
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
router.post('/deliveryman/register', upload.fields([
  { name: 'pdf1', maxCount: 1 },
  { name: 'pdf2', maxCount: 1 },
  { name: 'pdf3', maxCount: 1 }
]), authController.registerDeliveryMan);
/**
 * @openapi
 * /api/auth/deliveryman/login:
 *   post:
 *     summary: Login as a delivery driver
 *     description: |
 *       Authenticates a delivery driver using phone number or email and password.
 *       - Can login with either phoneNumber or emailAddress
 *       - Account must have isActive=true and status='active'
 *       - Returns JWT token with delivery driver details
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: Delivery driver phone number (either phoneNumber or emailAddress required)
 *                 example: '+1234567700'
 *               emailAddress:
 *                 type: string
 *                 format: email
 *                 description: Delivery driver email address (either phoneNumber or emailAddress required)
 *                 example: mike@example.com
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 deliveryMan:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     phoneNumber:
 *                       type: string
 *                     emailAddress:
 *                       type: string
 *                       nullable: true
 *                     isActive:
 *                       type: boolean
 *       '400':
 *         description: Missing credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Phone number or email address and password are required
 *       '401':
 *         description: Invalid credentials or deleted account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 *       '403':
 *         description: Account is not active
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Account is not active
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.post('/deliveryman/login', authController.loginDeliveryMan);

/**
 * @openapi
 * /api/auth/customer/verify-otp:
 *   post:
 *     summary: Verify OTP code for customer registration
 *     description: |
 *       Verifies the OTP code sent to customer's phone number during registration.
 *       - Activates the customer account upon successful verification
 *       - Returns JWT token for immediate login
 *       - OTP expires after 10 minutes
 *       - Maximum 5 verification attempts per OTP
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - code
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: Customer phone number
 *                 example: '+201024020627'
 *               code:
 *                 type: string
 *                 description: 6-digit OTP code
 *                 example: '222222'
 *     responses:
 *       '200':
 *         description: Phone number verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Phone number verified successfully
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 customer:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       nullable: true
 *                     phoneNumber:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *       '400':
 *         description: Invalid or expired OTP / Account already verified / Too many attempts
 *       '404':
 *         description: Customer not found
 *       '500':
 *         description: Server error
 */
router.post('/customer/verify-otp', authController.verifyOTP);

/**
 * @openapi
 * /api/auth/customer/resend-otp:
 *   post:
 *     summary: Resend OTP code to customer
 *     description: |
 *       Resends a new OTP code to the customer's phone number.
 *       - Rate limited to once every 5 minutes
 *       - New OTP expires after 10 minutes
 *       - Only available for unverified accounts
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: Customer phone number
 *                 example: '+201024020627'
 *     responses:
 *       '200':
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP sent successfully
 *                 expiresIn:
 *                   type: integer
 *                   description: OTP expiration time in seconds
 *                   example: 600
 *       '400':
 *         description: Account already verified
 *       '404':
 *         description: Customer not found
 *       '429':
 *         description: Rate limit exceeded - must wait 5 minutes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Please wait 5 minutes before requesting a new OTP
 *                 remainingSeconds:
 *                   type: integer
 *                   description: Seconds remaining before next OTP can be requested
 *       '500':
 *         description: Server error / Failed to send OTP
 */
router.post('/customer/resend-otp', authController.resendOTP);

/**
 * @openapi
 * /api/auth/admin/login:
 *   post:
 *     summary: Admin login
 *     description: Authenticate an admin user with phone number and password
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - password
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: Admin phone number
 *                 example: '0999999999'
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 'string'
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 admin:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Admin User
 *                     email:
 *                       type: string
 *                       example: admin@example.com
 *                     phoneNumber:
 *                       type: string
 *                       example: '0999999999'
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *       '400':
 *         description: Missing credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Phone number and password are required
 *       '401':
 *         description: Invalid credentials or deleted account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 *       '403':
 *         description: Account is not active
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Account is not active
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.post('/admin/login', authController.loginAdmin);

module.exports = router;
