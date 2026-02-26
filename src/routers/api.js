const express = require('express');
const router = express.Router();
const authApi = require('./auth');
const categoryApi = require('./category');
const productApi = require('./product');
const addonsApi = require('./addons');
const restaurantsApi = require('./restaurants')
const screensApi = require('./screens')
const comboApi = require('./combo')
const offerApi = require('./offer')
const addressApi =require('./address')
const cartApi = require('./cart')
const orderApi = require('./order')
const profileApi = require('./profile')
const favApi = require('./fav')
const adminApi = require('./admin')
const configApi = require('./config')
const paymobApi = require('./paymob')
const sectionApi = require('./section')
const rateApi = require('./rate')
const homeAds = require('./homeAds')
const deeplinkApi = require('./deeplink')

router.use('/auth',authApi);// 
router.use('/category',categoryApi)//           need update (when deactivating and delete the  product --linked-- (offer/combo/cartItem))
router.use('/product',productApi)//             need update (when deactivating and delete the  product --linked-- (offer/combo/cartItem))
router.use('/addons',addonsApi)//               
router.use('/restaurants',restaurantsApi)//     
router.use('/combo',comboApi)//
router.use('/offer',offerApi)// need update
router.use('/address',addressApi)//
router.use('/cart',cartApi)//
router.use('/orders',orderApi)//
router.use('/profile',profileApi)//
router.use('/fav',favApi)//
router.use('/admin',adminApi)//
router.use('/config',configApi)//
router.use('/paymob',paymobApi)//
router.use('/section',sectionApi)//

router.use('/rate',rateApi)//

router.use('/screens',screensApi)// 

router.use('/home-ads',homeAds)//

router.use('/deeplink',deeplinkApi)//

module.exports = router;

