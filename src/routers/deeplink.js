const express = require('express');
const router = express.Router();
const deeplinkController = require('../controllers/deeplink');

/**
 * @openapi
 * tags:
 *   - name: Deep Links
 *     description: Deep link handlers for mobile app integration
 */

/**
 * @openapi
 * /api/deeplink/friend-payment/{fcode}:
 *   get:
 *     summary: Deep link handler for friend payment (universal link)
 *     description: |
 *       Universal/deep link handler that intelligently redirects users based on their device and context.
 *       
 *       **Behavior:**
 *       - **Mobile devices**: Shows an intermediate page that attempts to open the mobile app using the deep link scheme (e.g., `supermarket://friend-payment/{fcode}`). If the app is not installed, redirects to the appropriate app store (iOS App Store or Google Play Store). Users can also choose to continue in the browser.
 *       - **Desktop devices**: Directly redirects to the web version of the friend payment page.
 *       
 *       **Deep Link Scheme:**
 *       - Format: `{APP_SCHEME}://friend-payment/{fcode}`
 *       - Default scheme: `supermarket://friend-payment/{fcode}`
 *       - Configurable via `APP_SCHEME` environment variable
 *       
 *       **Use Case:**
 *       When a customer creates an order with `paymentMethod='friend'`, they can share this deep link URL instead of the direct API URL. This provides a better user experience by automatically opening the mobile app if installed, or offering to download it.
 *       
 *       **Environment Variables Required:**
 *       - `APP_SCHEME`: Custom URL scheme for your mobile app (default: 'supermarket')
 *       - `BASE_URL`: Base URL of your API server
 *       - `APP_STORE_URL`: iOS App Store URL (optional)
 *       - `PLAY_STORE_URL`: Google Play Store URL (optional)
 *     tags:
 *       - Deep Links
 *     parameters:
 *       - in: path
 *         name: fcode
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique order FCODE (format "orderId-RANDOMCHARS", e.g., "123-ABC123XYZ")
 *         example: "123-ABC123XYZ"
 *     responses:
 *       '200':
 *         description: Returns HTML page for mobile devices or redirects for desktop
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML page with deep link handling and fallback options
 *       '302':
 *         description: Redirect to web version (desktop only)
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: https://yourdomain.com/api/orders/friend-payment/123-ABC123XYZ
 *       '400':
 *         description: FCODE is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: FCODE is required
 *       '500':
 *         description: Failed to process deep link
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to process deep link
 *                 error:
 *                   type: string
 */
router.get('/friend-payment/:fcode', deeplinkController.handleFriendPaymentDeepLink);

module.exports = router;
