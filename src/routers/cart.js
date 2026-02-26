const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart');
const ensureActive = require('../validaters').ensureActive;

/**
 * @openapi
 * tags:
 *   - name: Cart
 *     description: Multi-restaurant shopping cart management
 */

/**
 * @openapi
 * /api/cart/add:
 *   post:
 *     summary: Add product or combo with addons to cart
 *     description: Adds a product or combo to the customer's cart. Automatically creates a restaurant-specific cart if it doesn't exist. If a product with the SAME addons exists, quantity is incremented. If a product with DIFFERENT addons is added, a new cart item is created (allowing multiple cart items with same productId but different addon configurations). Addons are linked to the parent product via parentCartItemId.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - type
 *             properties:
 *               customerId:
 *                 type: integer
 *                 description: Must match the authenticated customer id
 *               type:
 *                 type: string
 *                 enum: [product, combo]
 *                 description: Type of item being added
 *               product:
 *                 type: object
 *                 description: Required if type is 'product'
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Product ID
 *                   quantity:
 *                     type: integer
 *                     minimum: 1
 *                     default: 1
 *                   notes:
 *                     type: string
 *                     description: Special instructions
 *                   addons:
 *                     type: array
 *                     description: Array of addon IDs to add to this product
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: Addon ID
 *               combo:
 *                 type: object
 *                 description: Required if type is 'combo'
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Combo ID
 *                   quantity:
 *                     type: integer
 *                     minimum: 1
 *                     default: 1
 *                   notes:
 *                     type: string
 *           examples:
 *             productWithAddons:
 *               summary: Product with addons
 *               value:
 *                 customerId: 1
 *                 type: product
 *                 product:
 *                   id: 5
 *                   quantity: 2
 *                   notes: "No pickles"
 *                   addons:
 *                     - id: 1
 *                     - id: 3
 *             combo:
 *               summary: Combo
 *               value:
 *                 customerId: 1
 *                 type: combo
 *                 combo:
 *                   id: 1
 *                   quantity: 1
 *                   notes: "Extra napkins"
 *     responses:
 *       '200':
 *         description: Product added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product added to cart successfully
 *       '400':
 *         description: Validation error (missing fields, invalid quantity)
 *       '401':
 *         description: Unauthorized (customerId doesn't match authenticated user)
 *       '404':
 *         description: Customer, product, combo, or restaurant not found
 *       '500':
 *         description: Server error
 */
router.post('/add', ensureActive, cartController.addProductToCart);

/**
 * @openapi
 * /api/cart/addPless:
 *   post:
 *     summary: Add product with addons to plessing cart
 *     description: Adds a product to the customer's plessing cart. Automatically creates a restaurant-specific plessing cart if it doesn't exist. Uses plessing offers (isPleassing=true) for pricing. Only products with active plessing offers can be added. The product price is determined by the plessingPrice field from the offer, or falls back to the base sale price if no plessing offer exists.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - product
 *             properties:
 *               customerId:
 *                 type: integer
 *                 description: Must match the authenticated customer id
 *               product:
 *                 type: object
 *                 required:
 *                   - id
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Product ID
 *                   quantity:
 *                     type: integer
 *                     minimum: 1
 *                     default: 1
 *                   notes:
 *                     type: string
 *                     description: Special instructions
 *                   addons:
 *                     type: array
 *                     description: Array of addon IDs to add to this product
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: Addon ID
 *           examples:
 *             productWithAddons:
 *               summary: Product with plessing price and addons
 *               value:
 *                 customerId: 1
 *                 product:
 *                   id: 5
 *                   quantity: 2
 *                   notes: "No pickles"
 *                   addons:
 *                     - id: 1
 *                     - id: 3
 *             productSimple:
 *               summary: Simple product without addons
 *               value:
 *                 customerId: 1
 *                 product:
 *                   id: 5
 *                   quantity: 1
 *     responses:
 *       '200':
 *         description: Product added to plessing cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product added to plessing cart successfully
 *       '400':
 *         description: Validation error (missing fields, invalid quantity)
 *       '401':
 *         description: Unauthorized (customerId doesn't match authenticated user)
 *       '404':
 *         description: Customer, product, or restaurant not found
 *       '500':
 *         description: Server error
 */
router.post('/addPless', ensureActive, cartController.addPless);

/**
 * @openapi
 * /api/cart/remove:
 *   post:
 *     summary: Remove cart item from cart
 *     description: Removes a specific cart item from the cart by cartItemId. Also removes associated addons. Since multiple cart items can have the same product with different addons, cartItemId is used to identify the exact item to remove. Recalculates cart totals after removal.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - cartItemId
 *             properties:
 *               customerId:
 *                 type: integer
 *                 description: Must match the authenticated customer id
 *               cartItemId:
 *                 type: integer
 *                 description: ID of the cart item to remove (obtained from getCart response)
 *           examples:
 *             removeCartItem:
 *               summary: Remove cart item
 *               value:
 *                 customerId: 1
 *                 cartItemId: 123
 *     responses:
 *       '200':
 *         description: Item removed from cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Item removed from cart successfully
 *       '400':
 *         description: Cart Item ID is required
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Cart item not found
 *       '500':
 *         description: Server error
 */
router.post('/remove', ensureActive, cartController.removeProductFromCart);

/**
 * @openapi
 * /api/cart/clear:
 *   post:
 *     summary: Clear all items from a restaurant-specific cart
 *     description: Removes all items from the cart for a specific restaurant and resets totals to zero. Can optionally specify isPlessing to clear only plessing or non-plessing carts.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - restaurantId
 *             properties:
 *               customerId:
 *                 type: integer
 *                 description: Must match the authenticated customer id
 *               restaurantId:
 *                 type: integer
 *                 description: Restaurant whose cart should be cleared
 *               isPlessing:
 *                 type: boolean
 *                 description: Optional. If specified, only clear plessing (true) or non-plessing (false) cart
 *     responses:
 *       '200':
 *         description: Cart cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cart cleared successfully
 *       '400':
 *         description: Restaurant ID is required
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: No active carts found
 *       '500':
 *         description: Server error
 */
router.post('/clear', ensureActive, cartController.clearCart);

/**
 * @openapi
 * /api/cart/update:
 *   post:
 *     summary: Update cart item quantity or notes
 *     description: Updates the quantity and/or notes for a specific cart item by cartItemId. Since multiple cart items can have the same product with different addons, cartItemId is used to identify the exact item. When quantity is updated, associated addon quantities are automatically updated to match. Cart totals are automatically recalculated.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - cartItemId
 *             properties:
 *               customerId:
 *                 type: integer
 *                 description: Must match the authenticated customer id
 *               cartItemId:
 *                 type: integer
 *                 description: ID of the cart item to update (obtained from getCart response)
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: New quantity (optional, also updates addon quantities)
 *               notes:
 *                 type: string
 *                 description: Updated notes (optional)
 *           examples:
 *             updateQuantity:
 *               summary: Update cart item quantity
 *               value:
 *                 customerId: 1
 *                 cartItemId: 123
 *                 quantity: 3
 *             updateNotes:
 *               summary: Update cart item notes
 *               value:
 *                 customerId: 1
 *                 cartItemId: 123
 *                 notes: "Extra spicy"
 *     responses:
 *       '200':
 *         description: Cart item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cart item updated successfully
 *       '400':
 *         description: Validation error (cartItemId required, quantity must be >= 1)
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Cart item not found
 *       '500':
 *         description: Server error
 */
router.post('/update', ensureActive, cartController.updateCart);

/**
 * @openapi
 * /api/cart/get/{customerId}:
 *   get:
 *     summary: Get all active carts for a customer
 *     description: Retrieves all active carts grouped by restaurant with products, combos, and their addons. Returns formatted cart data with product details, offers, and cartItemId for each item. Note that the same product can appear multiple times with different addon configurations, each with a unique cartItemId. Only returns carts that contain items (empty carts are filtered out).
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer ID (must match authenticated user)
 *     responses:
 *       '200':
 *         description: Carts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 carts:
 *                   type: array
 *                   description: Array of carts grouped by restaurant (only carts with items are included)
 *                   items:
 *                     type: object
 *                     properties:
 *                       resID:
 *                         type: integer
 *                         description: Restaurant ID
 *                       resName:
 *                         type: string
 *                         description: Restaurant name
 *                       products:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             cartItemId:
 *                               type: integer
 *                               description: Unique cart item ID (use this for update/remove operations)
 *                             name:
 *                               type: string
 *                             id:
 *                               type: integer
 *                               description: Product ID
 *                             ImageUrl:
 *                               type: string
 *                               description: Product image URL
 *                             quantity:
 *                               type: integer
 *                             price:
 *                               type: string
 *                               description: Product sale price
 *                             offer:
 *                               type: object
 *                               nullable: true
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                 name:
 *                                   type: string
 *                                 type:
 *                                   type: string
 *                                   enum: [percentage, amount]
 *                                 amount:
 *                                   type: number
 *                                   nullable: true
 *                                 percentage:
 *                                   type: number
 *                                   nullable: true
 *                                 startDate:
 *                                   type: string
 *                                   format: date-time
 *                                   nullable: true
 *                                 endDate:
 *                                   type: string
 *                                   format: date-time
 *                                   nullable: true
 *                             addons:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   name:
 *                                     type: string
 *                                   id:
 *                                     type: integer
 *                                   price:
 *                                     type: string
 *                       combo:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             cartItemId:
 *                               type: integer
 *                               description: Unique cart item ID (use this for update/remove operations)
 *                             name:
 *                               type: string
 *                             id:
 *                               type: integer
 *                               description: Combo ID
 *                             price:
 *                               type: number
 *                               description: Combo price
 *                             quantity:
 *                               type: integer
 *             example:
 *               carts:
 *                 - resID: 1
 *                   resName: "Pizza Palace"
 *                   products:
 *                     - cartItemId: 123
 *                       name: "Margherita Pizza"
 *                       id: 1
 *                       ImageUrl: "https://www.kuducompany.com/@fs/var/www/kudu/attached_assets/k5.jpeg"
 *                       quantity: 1
 *                       price: "12.99"
 *                       offer:
 *                         id: 1
 *                         name: "20% Off Margherita"
 *                         type: "percentage"
 *                         amount: null
 *                         percentage: 20
 *                         startDate: null
 *                         endDate: null
 *                       addons:
 *                         - name: "Extra Cheese"
 *                           id: 1
 *                           price: "2.50"
 *                     - cartItemId: 124
 *                       name: "Margherita Pizza"
 *                       id: 1
 *                       ImageUrl: "https://www.kuducompany.com/@fs/var/www/kudu/attached_assets/k5.jpeg"
 *                       quantity: 2
 *                       price: "12.99"
 *                       offer:
 *                         id: 1
 *                         name: "20% Off Margherita"
 *                         type: "percentage"
 *                         amount: null
 *                         percentage: 20
 *                         startDate: null
 *                         endDate: null
 *                       addons:
 *                         - name: "Pepperoni"
 *                           id: 2
 *                           price: "3.00"
 *                   combo:
 *                     - cartItemId: 125
 *                       name: "Pizza Party Combo"
 *                       id: 1
 *                       price: 35.99
 *                       quantity: 1
 *       '401':
 *         description: Unauthorized - Customer ID does not match authenticated user
 *       '500':
 *         description: Server error
 */
router.get('/get/:customerId', ensureActive, cartController.getCart);

/**
 * @openapi
 * /api/cart/convert-to-order:
 *   post:
 *     summary: Convert cart to order with multiple payment options
 *     description: |
 *       Creates a new Order with OrderItems from the active cart. The cart items are converted to order items, and the cart is marked as 'ordered' and inactive. 
 *       
 *       **Payment Methods:**
 *       - **cash**: Order goes directly to 'pending' status, marked as 'paid' (cash on delivery). Restaurant receives immediate notification.
 *       - **digital**: Order starts as 'unpaid' until payment succeeds via Paymob. Returns payment iframe URL. Restaurant notified after successful payment.
 *       - **friend**: Order starts as 'unpaid'. Returns a shareable URL with fcode that can be sent to a friend to complete payment. Friend can view order details and pay without authentication.
 *       
 *       The isPlessing parameter determines which cart type to convert (regular or plessing). For plessing carts, all products must have active plessing offers or the conversion will fail.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - restaurantId
 *               - addressId
 *               - paymentMethod
 *             properties:
 *               customerId:
 *                 type: integer
 *                 description: Must match the authenticated customer id
 *               restaurantId:
 *                 type: integer
 *                 description: Restaurant whose cart should be converted
 *               addressId:
 *                 type: integer
 *                 description: Delivery address ID (required)
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, digital, friend]
 *                 description: Payment method - "cash" (pay on delivery), "digital" (pay now via Paymob), or "friend" (share payment link with friend)
 *               notes:
 *                 type: string
 *                 description: Order notes (optional)
 *               isPlessing:
 *                 type: boolean
 *                 description: If true, converts the plessing cart (isPlessing=true). If false or omitted, converts the regular cart (isPlessing=false). For plessing carts, validates that all products have active plessing offers before conversion.
 *           examples:
 *             cashPayment:
 *               summary: Cash payment (pay on delivery)
 *               value:
 *                 customerId: 1
 *                 restaurantId: 5
 *                 addressId: 10
 *                 paymentMethod: cash
 *                 isPlessing: false
 *                 notes: "Please ring the doorbell"
 *             digitalPayment:
 *               summary: Digital payment (pay now)
 *               value:
 *                 customerId: 1
 *                 restaurantId: 5
 *                 addressId: 10
 *                 paymentMethod: digital
 *                 isPlessing: false
 *             friendPayment:
 *               summary: Friend payment (share link)
 *               value:
 *                 customerId: 1
 *                 restaurantId: 5
 *                 addressId: 10
 *                 paymentMethod: friend
 *                 isPlessing: false
 *                 notes: "My friend will pay for this"
 *             plessingFriendPayment:
 *               summary: Plessing cart (isPlessing=true) with friend payment
 *               value:
 *                 customerId: 1
 *                 restaurantId: 5
 *                 addressId: 10
 *                 paymentMethod: friend
 *                 isPlessing: true
 *                 notes: "This is a plessing order; my friend will pay"
 *     responses:
 *       '201':
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   description: Response for cash payment
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Order created successfully
 *                     order:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         orderNumber:
 *                           type: string
 *                         status:
 *                           type: string
 *                           example: pending
 *                         paymentStatus:
 *                           type: string
 *                           example: paid
 *                         totalAmount:
 *                           type: number
 *                 - type: object
 *                   description: Response for digital payment
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Order created successfully. Please complete payment.
 *                     order:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         orderNumber:
 *                           type: string
 *                         status:
 *                           type: string
 *                           example: unpaid
 *                         paymentStatus:
 *                           type: string
 *                           example: pending
 *                         totalAmount:
 *                           type: number
 *                     payment:
 *                       type: object
 *                       properties:
 *                         iframe_url:
 *                           type: string
 *                           description: Paymob payment iframe URL
 *                         payment_token:
 *                           type: string
 *                         paymob_order_id:
 *                           type: integer
 *                 - type: object
 *                   description: Response for friend payment
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Order created successfully. Share the payment link with your friend.
 *                     order:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         orderNumber:
 *                           type: string
 *                         fcode:
 *                           type: string
 *                           description: Unique code for sharing with friend
 *                           example: "123-ABC123XYZ"
 *                         status:
 *                           type: string
 *                           example: unpaid
 *                         paymentStatus:
 *                           type: string
 *                           example: pending
 *                         totalAmount:
 *                           type: number
 *                     friendPaymentUrl:
 *                       type: string
 *                       description: Direct API URL for friend to view order and complete payment
 *                       example: "https://yourdomain.com/api/orders/friend-payment/123-ABC123XYZ"
 *                     friendPaymentDeepLink:
 *                       type: string
 *                       description: Universal/deep link URL that opens mobile app if installed, otherwise redirects to app store or web version
 *                       example: "https://yourdomain.com/api/deeplink/friend-payment/123-ABC123XYZ"
 *       '400':
 *         description: Validation error - Restaurant ID required, cart is empty, invalid payment method, address ID required, or products missing active plessing offers (for plessing carts)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Payment method must be either "cash", "digital", or "friend"
 *                 products:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Pizza Margherita", "Burger Deluxe"]
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: No active cart found for this restaurant
 *       '500':
 *         description: Server error
 */
router.post('/convert-to-order', ensureActive, cartController.convertCartToOrder);

/**
 * @openapi
 * /api/cart/checkout-info:
 *   post:
 *     summary: Get checkout information for a cart
 *     description: Retrieves calculated payment details for a cart including subtotal, discounts, shipping, and total amount. Does not create an order. Validates plessing offers if applicable. Returns detailed breakdown of all items and their prices.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - restaurantId
 *               - addressId
 *             properties:
 *               customerId:
 *                 type: integer
 *                 description: Must match the authenticated customer id
 *               restaurantId:
 *                 type: integer
 *                 description: Restaurant ID for the cart
 *               addressId:
 *                 type: integer
 *                 description: Customer address ID for delivery location
 *               isPlessing:
 *                 type: boolean
 *                 description: Whether this is a plessing cart
 *                 default: false
 *           examples:
 *             regularCart:
 *               summary: Regular cart checkout info
 *               value:
 *                 customerId: 1
 *                 restaurantId: 5
 *                 addressId: 3
 *                 isPlessing: false
 *             plessingCart:
 *               summary: Plessing cart checkout info
 *               value:
 *                 customerId: 1
 *                 restaurantId: 5
 *                 addressId: 3
 *                 isPlessing: true
 *     responses:
 *       '200':
 *         description: Checkout information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Checkout information retrieved successfully
 *                 checkout:
 *                   type: object
 *                   properties:
 *                     restaurantId:
 *                       type: integer
 *                     restaurantName:
 *                       type: string
 *                     isPlessing:
 *                       type: boolean
 *                     itemsCount:
 *                       type: integer
 *                       description: Number of cart items
 *                     subTotal:
 *                       type: number
 *                       format: float
 *                       description: Total price of all items before fees
 *                     discountAmount:
 *                       type: number
 *                       format: float
 *                       description: Total discount applied
 *                     deliveryFee:
 *                       type: number
 *                       format: float
 *                       description: Distance-based delivery fee
 *                     systemFees:
 *                       type: number
 *                       format: float
 *                       description: System processing fees
 *                     shippingAmount:
 *                       type: number
 *                       format: float
 *                       description: Total delivery and system fees (deliveryFee + systemFees)
 *                     totalAmount:
 *                       type: number
 *                       format: float
 *                       description: Final total amount to pay (subTotal + shippingAmount)
 *                     distance:
 *                       type: number
 *                       format: float
 *                       description: Distance in kilometers between address and restaurant
 *                     itemsBreakdown:
 *                       type: array
 *                       description: Detailed breakdown of each cart item
 *                       items:
 *                         type: object
 *                         properties:
 *                           cartItemId:
 *                             type: integer
 *                           type:
 *                             type: string
 *                             enum: [product, combo]
 *                           productId:
 *                             type: integer
 *                           comboId:
 *                             type: integer
 *                           quantity:
 *                             type: integer
 *                           unitPrice:
 *                             type: number
 *                             format: float
 *                           totalPrice:
 *                             type: number
 *                             format: float
 *                           addons:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 addonId:
 *                                   type: integer
 *                                 quantity:
 *                                   type: integer
 *                                 unitPrice:
 *                                   type: number
 *                                   format: float
 *                                 totalPrice:
 *                                   type: number
 *                                   format: float
 *             examples:
 *               success:
 *                 summary: Successful checkout info response
 *                 value:
 *                   message: Checkout information retrieved successfully
 *                   checkout:
 *                     restaurantId: 5
 *                     restaurantName: Pizza Palace
 *                     isPlessing: false
 *                     itemsCount: 3
 *                     subTotal: 200.00
 *                     discountAmount: 0.00
 *                     deliveryFee: 115.00
 *                     systemFees: 40.00
 *                     shippingAmount: 155.00
 *                     totalAmount: 355.00
 *                     distance: 5.23
 *                     itemsBreakdown:
 *                       - cartItemId: 1
 *                         type: product
 *                         productId: 10
 *                         quantity: 2
 *                         unitPrice: 50.00
 *                         totalPrice: 100.00
 *                         addons: []
 *       '400':
 *         description: Cart is empty, validation error, or restaurant location not configured
 *         content:
 *           application/json:
 *             examples:
 *               emptyCart:
 *                 summary: Cart is empty
 *                 value:
 *                   message: Cart is empty
 *               missingAddress:
 *                 summary: Address ID is required
 *                 value:
 *                   message: Address ID is required
 *               noLocation:
 *                 summary: Restaurant location not configured
 *                 value:
 *                   message: Restaurant location not configured
 *       '401':
 *         description: Unauthorized - Customer ID mismatch
 *       '404':
 *         description: No active cart found for this restaurant or address not found
 *         content:
 *           application/json:
 *             examples:
 *               noCart:
 *                 summary: No active cart found
 *                 value:
 *                   message: No active cart found for this restaurant
 *               addressNotFound:
 *                 summary: Address not found
 *                 value:
 *                   message: Address not found
 *       '500':
 *         description: Server error
 */
router.post('/checkout-info', ensureActive, cartController.getCheckoutInfo);

module.exports = router;