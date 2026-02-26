const { Product, Combo, Addon, Offer, sequelize } = require('../../models');
const { Op } = require('sequelize');

/**
 * Calculate product price based on cart's isPlessing flag and active offers
 * @param {Object} product - Product entity
 * @param {boolean} isPlessing - Whether the cart is a plessing cart
 * @returns {number} - Calculated price
 */
const calculateProductPrice = async (productId, isPlessing) => {
    const currentDate = new Date();
    
    // Fetch product with offers
    const product = await Product.findOne({
        where: {
            id: productId,
            isActive: true,
            status: 'active'
        },
        include: [{
            model: Offer,
            as: 'offers',
            where: {
                isPleassing: isPlessing,
                status: 'active',
                isActive: true,
                [Op.or]: [
                    { startDate: null },
                    { startDate: { [Op.lte]: currentDate } }
                ],
                [Op.or]: [
                    { endDate: null },
                    { endDate: { [Op.gte]: currentDate } }
                ]
            },
            required: false
        }]
    });

    if (!product) {
        return 0;
    }

    const basePrice = parseFloat(product.salePrice);

    // If plessing cart and has plessing offer, use plessingPrice
    if (isPlessing && product.offers && product.offers.length > 0) {
        const offer = product.offers[0];
        if (offer.plessingPrice) {
            return parseFloat(offer.plessingPrice);
        }
    }

    // If non-plessing cart and has offer, apply discount
    if (!isPlessing && product.offers && product.offers.length > 0) {
        const offer = product.offers[0];
        
        if (offer.type === 'amount' && offer.amount) {
            const discountAmount = parseFloat(offer.amount);
            return Math.max(0, basePrice - discountAmount);
        } else if (offer.type === 'percentage' && offer.percentage) {
            const discountAmount = (basePrice * parseFloat(offer.percentage)) / 100;
            return Math.max(0, basePrice - discountAmount);
        }
    }

    // No offer or plessing offer without plessingPrice, return base price
    return basePrice;
};

/**
 * Calculate combo price
 * @param {number} comboId - Combo ID
 * @returns {number} - Combo price
 */
const calculateComboPrice = async (comboId) => {
    const combo = await Combo.findOne({
        where: {
            id: comboId,
            isActive: true,
            status: 'active'
        }
    });

    if (!combo) {
        return 0;
    }

    return parseFloat(combo.price);
};

/**
 * Calculate addon price
 * @param {number} addonId - Addon ID
 * @returns {number} - Addon price
 */
const calculateAddonPrice = async (addonId) => {
    const addon = await Addon.findOne({
        where: {
            id: addonId,
            isActive: true,
            status: 'active'
        }
    });

    if (!addon) {
        return 0;
    }

    return parseFloat(addon.salePrice);
};

/**
 * Calculate total price for a cart item including addons
 * @param {Object} cartItem - Cart item with childItems
 * @param {boolean} isPlessing - Whether the cart is a plessing cart
 * @returns {Object} - { itemPrice, addonsPrice, totalPrice }
 */
const calculateCartItemPrice = async (cartItem, isPlessing) => {
    let itemPrice = 0;
    let addonsPrice = 0;

    // Calculate main item price
    if (cartItem.type === 'product' && cartItem.productId) {
        const unitPrice = await calculateProductPrice(cartItem.productId, isPlessing);
        itemPrice = unitPrice * cartItem.quantity;
    } else if (cartItem.type === 'combo' && cartItem.comboId) {
        const unitPrice = await calculateComboPrice(cartItem.comboId);
        itemPrice = unitPrice * cartItem.quantity;
    }

    // Calculate addons price
    if (cartItem.childItems && cartItem.childItems.length > 0) {
        for (const addon of cartItem.childItems) {
            if (addon.type === 'addon' && addon.addonId) {
                const addonUnitPrice = await calculateAddonPrice(addon.addonId);
                addonsPrice += addonUnitPrice * addon.quantity;
            }
        }
    }

    return {
        itemPrice,
        addonsPrice,
        totalPrice: itemPrice + addonsPrice
    };
};

module.exports = {
    calculateProductPrice,
    calculateComboPrice,
    calculateAddonPrice,
    calculateCartItemPrice
};
