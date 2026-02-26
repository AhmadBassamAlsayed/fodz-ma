const { Cart, CartItem, Product, Addon, Combo, AddonPerProduct, Restaurant, Customer, Offer, Order, OrderItem, Config, Address, PayMobOrder, sequelize } = require('../../models');
const { Op } = require('sequelize');
const { sendNotificationToToken } = require('../utils/firebase');
const paymobService = require('../services/paymob');
const { calculateProductPrice, calculateComboPrice, calculateAddonPrice, calculateCartItemPrice } = require('./cart-price-calculator');
const { calculateDistance, calculateDeliveryPrice } = require('../utils/distanceCalculator');

const addProductToCart = async (req, res) => {
    try {
        const { customerId, product, combo,type } = req.body;

        // Validation
        if (customerId!== req.user.customerId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!product && !combo) {
            return res.status(400).json({ message: 'Product or Combo is required' });
        }

        // Extract product/combo details
        const itemId = product?.id || combo?.id;
        const itemQuantity = product?.quantity || combo?.quantity || 1;
        const itemNotes = product?.notes || combo?.notes || null;
        const itemAddons = product?.addons || [];

        if (itemQuantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }
        // Verify customer exists
        const customer = await Customer.findByPk(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        let restaurantId;
        let itemType;
        let productData = null;
        let comboData = null;
        // Determine item type and get details
        if (type === 'product' && product) {
            productData = await Product.findOne({
                where: {
                    id: itemId,
                    isActive: true,
                    status: 'active'
                }
            });
            if (!productData) {
                return res.status(404).json({ message: 'Product not found' });
            }
            restaurantId = productData.restaurantId;
            itemType = 'product';
        } else if (type === 'combo' && combo) {
            comboData = await Combo.findOne({
                where: {
                    id: itemId,
                    isActive: true,
                    status: 'active'
                }
            });
            if (!comboData) {
                return res.status(404).json({ message: 'Combo not found' });
            }
            restaurantId = comboData.restaurantId;
            itemType = 'combo';
        }

        // Verify restaurant exists
        const restaurant = await Restaurant.findOne({
            where: {
                id: restaurantId,
                isActive: true,
                status: 'active'
            }
        });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Find or create active cart for this customer and restaurant (non-plessing)
        let cart = await Cart.findOne({
            where: {
                customerId,
                restaurantId,
                status: 'active',
                isActive: true,
                isPlessing: false  // Only check non-plessing carts
            }
        });

        if (!cart) {
            cart = await Cart.create({
                customerId,
                restaurantId,
                totalAmount: 0,
                totalItems: 0,
                isActive: true,
                status: 'active',
                isPlessing: false,  // Explicitly set as non-plessing cart
                createdBy: req.user.name,
                updatedBy: req.user.name
            });
        }

        // Check if item already exists in cart with same addons
        const existingItems = await CartItem.findAll({
            where: {
                cartId: cart.id,
                productId: product ? itemId : null,
                comboId: combo ? itemId : null,
                parentCartItemId: null,
                status: 'active',
                isActive: true
            },
            include: [{
                model: CartItem,
                as: 'childItems',
                where: { status: 'active', isActive: true, type: 'addon' },
                required: false
            }]
        });

        // Helper function to compare addon arrays
        const compareAddons = (existingAddons, newAddons) => {
            const existingAddonIds = existingAddons.map(a => a.addonId).sort();
            const newAddonIds = newAddons.map(a => (a.id || a)).sort();
            
            if (existingAddonIds.length !== newAddonIds.length) return false;
            
            return existingAddonIds.every((id, index) => id === newAddonIds[index]);
        };

        // Find existing item with same addons
        let matchingItem = null;
        for (const item of existingItems) {
            const existingAddons = item.childItems || [];
            if (compareAddons(existingAddons, itemAddons)) {
                matchingItem = item;
                break;
            }
        }

        let parentCartItemId = null;
        
        if (matchingItem) {
            // Update existing item with same addons - increment quantity
            const newQuantity = matchingItem.quantity + itemQuantity;

            await matchingItem.update({
                quantity: newQuantity,
                notes: itemNotes || matchingItem.notes,
                updatedBy: req.user.name
            });

            // Update addon quantities to match parent quantity
            if (matchingItem.childItems && matchingItem.childItems.length > 0) {
                for (const addonItem of matchingItem.childItems) {
                    await addonItem.update({
                        quantity: newQuantity,
                        updatedBy: req.user.name
                    });
                }
            }

            parentCartItemId = matchingItem.id;
        } else {
            // Create new cart item (different addons or no existing item)
            const newCartItem = await CartItem.create({
                restaurantId,
                cartId: cart.id,
                productId: product ? itemId : null,
                comboId: combo ? itemId : null,
                addonId: null,
                parentCartItemId: null,
                type: itemType,
                quantity: itemQuantity,
                notes: itemNotes,
                status: 'active',
                isActive: true,
                createdBy: req.user.name,
                updatedBy: req.user.name
            });

            parentCartItemId = newCartItem.id;

            // Add addons for the new cart item
            if (itemAddons && itemAddons.length > 0) {
                for (const addonItem of itemAddons) {
                    const addonId = addonItem.id || addonItem;
                    
                    // Fetch addon details
                    const addonData = await Addon.findOne({
                        where: {
                            id: addonId,
                            isActive: true,
                            status: 'active'
                        },
                        include: [{
                            model: AddonPerProduct,
                            as: 'addonProducts',
                            required: true,
                            where: {
                                productId: productData.id,
                                isActive: true,
                                status: 'active'
                            }
                        }]
                    });
                    
                    if (!addonData) {
                        continue; // Skip invalid addons
                    }

                    // Addon total price = addon unit price × parent product quantity
                    const addonTotalPrice = parseFloat(addonData.salePrice) * itemQuantity;

                    // Create addon cart item
                    await CartItem.create({
                        restaurantId,
                        cartId: cart.id,
                        productId: null,
                        comboId: null,
                        addonId: addonId,
                        parentCartItemId: parentCartItemId,
                        type: 'addon',
                        quantity: itemQuantity,
                        unitPrice: addonData.salePrice,
                        totalPrice: addonTotalPrice,
                        notes: null,
                        status: 'active',
                        isActive: true,
                        createdBy: req.user.name,
                        updatedBy: req.user.name
                    });
                }
            }
        }

        // Recalculate cart totals
        const cartItems = await CartItem.findAll({
            where: {
                cartId: cart.id,
                status: 'active',
                isActive: true
            }
        });

        let newTotalAmount = 0;
        let newTotalItems = 0;

        for (const item of cartItems) {
            // Add all item prices (products, combos, and addons)
            newTotalAmount += parseFloat(item.totalPrice) || 0;
            
            // Only count parent items (products/combos) in totalItems, not addons
            if (item.type !== 'addon' && !item.parentCartItemId) {
                newTotalItems += item.quantity;
            }
        }

        await cart.update({
            totalAmount: newTotalAmount,
            totalItems: newTotalItems,
            updatedBy: req.user.name
        });

        // Fetch updated cart with items
        // const updatedCart = await Cart.findByPk(cart.id, {
        //     include: [
        //         {
        //             model: CartItem,
        //             as: 'items',
        //             where: { status: 'active', isActive: true },
        //             required: false,
        //             include: [
        //                 { model: Product, as: 'product' },
        //                 { model: Addon, as: 'addon' },
        //                 { model: Combo, as: 'combo' }
        //             ]
        //         },
        //         { model: Restaurant, as: 'restaurant' }
        //     ]
        // });

        res.status(200).json({
            message: 'Product added to cart successfully',
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

const addPless = async (req, res) => {
    try {
        const { customerId, product } = req.body;

        // Validation
        if (customerId !== req.user.customerId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!product ) {
            return res.status(400).json({ message: 'Product is required' });
        }

        // Extract product details
        const itemId = product?.id;
        const itemQuantity = product?.quantity || 1;
        const itemNotes = product?.notes || null;
        const itemAddons = product?.addons || [];

        if (itemQuantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }
        // Verify customer exists
        const customer = await Customer.findByPk(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        let restaurantId;
        let unitPrice;
        let itemType;
        let productData = null;
        // Determine item type and get details
        const currentDate = new Date();
        productData = await Product.findOne({
            where: {
                id: itemId,
                isActive: true,
                status: 'active'
            },
            include: [{
                model: Offer,
                as: 'offers',
                where: {
                    isPleassing: true,  // Only get plessing offers
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
        if (!productData) {
            return res.status(404).json({ message: 'Product not found' });
        }
        restaurantId = productData.restaurantId;
        
        // Use plessing price if available
        let basePrice = parseFloat(productData.salePrice);
        
        if (productData.offers && productData.offers.length > 0) {
            const offer = productData.offers[0]; // Take the first active plessing offer
            unitPrice = parseFloat(offer.plessingPrice);
        } else {
            unitPrice = basePrice;
        }
        itemType = 'product';
        // Verify restaurant exists
        const restaurant = await Restaurant.findOne({
            where: {
                id: restaurantId,
                isActive: true,
                status: 'active'
            }
        });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Find or create plessing cart for this customer and restaurant
        let cart = await Cart.findOne({
            where: {
                customerId,
                restaurantId,
                status: 'active',
                isActive: true,
                isPlessing: true  // Plessing cart
            }
        });

        if (!cart) {
            cart = await Cart.create({
                customerId,
                restaurantId,
                totalAmount: 0,
                totalItems: 0,
                isActive: true,
                status: 'active',
                isPlessing: true,  // Mark as plessing cart
                createdBy: req.user.name,
                updatedBy: req.user.name
            });
        }

        // Check if item already exists in cart with same addons
        const existingItems = await CartItem.findAll({
            where: {
                cartId: cart.id,
                productId: product ? itemId : null,
                parentCartItemId: null,
                status: 'active',
                isActive: true
            },
            include: [{
                model: CartItem,
                as: 'childItems',
                where: { status: 'active', isActive: true, type: 'addon' },
                required: false
            }]
        });

        // Helper function to compare addon arrays
        const compareAddons = (existingAddons, newAddons) => {
            const existingAddonIds = existingAddons.map(a => a.addonId).sort();
            const newAddonIds = newAddons.map(a => (a.id || a)).sort();
            
            if (existingAddonIds.length !== newAddonIds.length) return false;
            
            return existingAddonIds.every((id, index) => id === newAddonIds[index]);
        };

        // Find existing item with same addons
        let matchingItem = null;
        for (const item of existingItems) {
            const existingAddons = item.childItems || [];
            if (compareAddons(existingAddons, itemAddons)) {
                matchingItem = item;
                break;
            }
        }

        const totalPrice = parseFloat(unitPrice) * itemQuantity;
        let parentCartItemId = null;
        
        if (matchingItem) {
            // Update existing item with same addons - increment quantity
            const newQuantity = matchingItem.quantity + itemQuantity;
            const newTotalPrice = parseFloat(unitPrice) * newQuantity;

            await matchingItem.update({
                quantity: newQuantity,
                unitPrice: unitPrice,
                totalPrice: newTotalPrice,
                notes: itemNotes || matchingItem.notes,
                updatedBy: req.user.name
            });

            // Update addon quantities to match parent quantity
            if (matchingItem.childItems && matchingItem.childItems.length > 0) {
                for (const addonItem of matchingItem.childItems) {
                    const addonTotalPrice = parseFloat(addonItem.unitPrice) * newQuantity;
                    await addonItem.update({
                        quantity: newQuantity,
                        totalPrice: addonTotalPrice,
                        updatedBy: req.user.name
                    });
                }
            }

            parentCartItemId = matchingItem.id;
        } else {
            // Create new cart item (different addons or no existing item)
            const newCartItem = await CartItem.create({
                restaurantId,
                cartId: cart.id,
                productId: product ? itemId : null,
                addonId: null,
                parentCartItemId: null,
                type: itemType,
                quantity: itemQuantity,
                unitPrice,
                totalPrice,
                notes: itemNotes,
                status: 'active',
                isActive: true,
                createdBy: req.user.name,
                updatedBy: req.user.name
            });

            parentCartItemId = newCartItem.id;

            // Add addons for the new cart item
            if (itemAddons && itemAddons.length > 0) {
                for (const addonItem of itemAddons) {
                    const addonId = addonItem.id || addonItem;
                    
                    // Fetch addon details
                    const addonData = await Addon.findOne({
                        where: {
                            id: addonId,
                            isActive: true,
                            status: 'active'
                        },
                        include: [{
                            model: AddonPerProduct,
                            as: 'addonProducts',
                            required: true,
                            where: {
                                productId: productData.id,
                                isActive: true,
                                status: 'active'
                            }
                        }]
                    });
                    
                    if (!addonData) {
                        continue; // Skip invalid addons
                    }

                    // Addon total price = addon unit price × parent product quantity
                    const addonTotalPrice = parseFloat(addonData.salePrice) * itemQuantity;

                    // Create addon cart item
                    await CartItem.create({
                        restaurantId,
                        cartId: cart.id,
                        productId: null,
                        comboId: null,
                        addonId: addonId,
                        parentCartItemId: parentCartItemId,
                        type: 'addon',
                        quantity: itemQuantity,
                        unitPrice: addonData.salePrice,
                        totalPrice: addonTotalPrice,
                        notes: null,
                        status: 'active',
                        isActive: true,
                        createdBy: req.user.name,
                        updatedBy: req.user.name
                    });
                }
            }
        }

        // Recalculate cart totals
        const cartItems = await CartItem.findAll({
            where: {
                cartId: cart.id,
                status: 'active',
                isActive: true
            }
        });

        let newTotalAmount = 0;
        let newTotalItems = 0;

        for (const item of cartItems) {
            // Add all item prices (products, combos, and addons)
            newTotalAmount += parseFloat(item.totalPrice) || 0;
            
            // Only count parent items (products/combos) in totalItems, not addons
            if (item.type !== 'addon' && !item.parentCartItemId) {
                newTotalItems += item.quantity;
            }
        }

        await cart.update({
            totalAmount: newTotalAmount,
            totalItems: newTotalItems,
            updatedBy: req.user.name
        });

        res.status(200).json({
            message: 'Product added to plessing cart successfully',
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

const removeProductFromCart = async (req, res) => {
    try {
        const { customerId, cartItemId } = req.body;

        if (customerId!== req.user.customerId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!cartItemId) {
            return res.status(400).json({ message: 'Cart Item ID is required' });
        }

        // Find cart item by cartItemId
        const cartItem = await CartItem.findOne({
            where: {
                id: cartItemId,
                parentCartItemId: null,
                status: 'active',
                isActive: true
            },
            include: [{
                model: Cart,
                as: 'cart',
                where: {
                    customerId,
                    status: 'active',
                    isActive: true
                }
            }]
        });

        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        const cart = cartItem.cart;

        // Remove the item
        await cartItem.update({
            status: 'removed',
            isActive: false,
            updatedBy: req.user.name
        });

        // Remove child items (addons) first
        await CartItem.update(
            {
                status: 'removed',
                isActive: false,
                updatedBy: req.user.name
            },
            {
                where: {
                    parentCartItemId: cartItem.id,
                    status: 'active'
                }
            }
        );

        // Recalculate cart totals
        const remainingItems = await CartItem.findAll({
            where: {
                cartId: cart.id,
                status: 'active',
                isActive: true
            }
        });

        let newTotalAmount = 0;
        let newTotalItems = 0;

        for (const item of remainingItems) {
            // Add all item prices (products, combos, and addons)
            newTotalAmount += parseFloat(item.totalPrice) || 0;
            
            // Only count parent items (products/combos) in totalItems, not addons
            if (item.type !== 'addon' && !item.parentCartItemId) {
                newTotalItems += item.quantity;
            }
        }

        await cart.update({
            totalAmount: newTotalAmount,
            totalItems: newTotalItems,
            updatedBy: req.user.name
        });

        // Fetch updated cart
        // const updatedCart = await Cart.findByPk(cart.id, {
        //     include: [
        //         {
        //             model: CartItem,
        //             as: 'items',
        //             where: { status: 'active', isActive: true },
        //             required: false,
        //             include: [
        //                 { model: Product, as: 'product' },
        //                 { model: Addon, as: 'addon' },
        //                 { model: Combo, as: 'combo' }
        //             ]
        //         },
        //         { model: Restaurant, as: 'restaurant' }
        //     ]
        // });
        await cartItem.destroy();

        res.status(200).json({
            message: 'Item removed from cart successfully',
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

const clearCart = async (req, res) => {
    try {
        const { customerId, restaurantId, isPlessing } = req.body;

        if (customerId!==req.user.customerId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if(!restaurantId){
            return res.status(400).json({ message: 'Restaurant ID is required' });
        }

        const whereClause = {
            customerId,
            status: 'active',
            isActive: true,
            restaurantId
        };

        // If isPlessing is specified, use it to find specific cart type
        if (isPlessing !== undefined) {
            whereClause.isPlessing = isPlessing;
        }

        const cart = await Cart.findOne({ where: whereClause });

        if (!cart) {
            return res.status(404).json({ message: 'No active carts found' });
        }

        await CartItem.destroy(
        {
            where: {
                cartId: cart.id,
                status: 'active',
                isActive: true,
                restaurantId
            }
        });

        await cart.update({
            totalAmount: 0,
            totalItems: 0,
            updatedBy: req.user.name
        });

        res.status(200).json({
            message: 'Cart cleared successfully',
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

const getCart = async (req, res) => {
    try {
        const customerId = Number(req.params.customerId);
        console.log(customerId,req.user.id);
        
        if (customerId!==req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Fetch all active carts for customer
        const currentDate = new Date();
        const carts = await Cart.findAll({
            attributes:['id','restaurantId','totalAmount','totalItems','notes','isPlessing','createdAt','updatedAt'],
            where: {
                customerId,
                status: 'active',
                isActive: true,
            },
            include: [
                {
                    model: CartItem,
                    as: 'items',
                    attributes:['id','productId','comboId','type','addonId','quantity','unitPrice','totalPrice','createdAt','updatedAt','createdBy','updatedBy'],
                    where: { status:'active', isActive: true,parentCartItemId:null},
                    required: false,
                    include: [
                        { 
                            model: Product, 
                            as: 'product',
                            attributes:['id','name','salePrice']
                        },
                        { 
                            model: Combo,
                            as: 'combo',
                            attributes:['id','name','price']
                        },
                        {
                            model:CartItem,
                            as:'childItems',
                            required:false,
                            attributes:['id','parentCartItemId','type','productId','comboId','addonId','quantity','unitPrice','totalPrice','createdAt','updatedAt','createdBy','updatedBy'],
                            where:{status:'active',isActive:true},
                            include:[
                                {model:Addon,as:'addon',attributes:['id','name','salePrice']},
                            ]
                        }
                    ]
                },
                { model: Restaurant, as: 'restaurant', where:{status:'active',isActive:true},attributes:['id','name'] }
            ] 
        });

        // Fetch offers for each cart based on isPlessing flag
        for (const cart of carts) {
            if (cart.items && cart.items.length > 0) {
                for (const item of cart.items) {
                    if (item.type === 'product' && item.product && item.productId) {
                        // Fetch offers based on cart's isPlessing flag
                        const offers = await Offer.findAll({
                            attributes: ['id', 'type', 'amount', 'percentage', 'plessingPrice', 'startDate', 'endDate'],
                            where: {
                                productId: item.productId,
                                isPleassing: cart.isPlessing || false,  // Match cart's isPlessing flag
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
                            }
                        });
                        
                        // Attach offers to product
                        item.product.offers = offers;
                    }
                }
            }
        }

        // Transform data to the requested format with dynamic price calculation
        const formattedCarts = await Promise.all(
            carts
                .filter(cart => cart.items && cart.items.length > 0) // Only include carts with items
                .map(async (cart) => {
                    const products = [];
                    const combos = [];

                    for (const item of cart.items) {
                        if (item.type === 'product' && item.product) {
                            // Calculate product price dynamically
                            const productPrice = await calculateProductPrice(item.productId, cart.isPlessing);
                            
                            // Extract addons for this product with dynamic prices
                            const addons = [];
                            if (item.childItems) {
                                for (const child of item.childItems) {
                                    if (child.type === 'addon' && child.addon) {
                                        const addonPrice = await calculateAddonPrice(child.addonId);
                                        addons.push({
                                            name: child.addon.name,
                                            id: child.addon.id,
                                            price: addonPrice.toString()
                                        });
                                    }
                                }
                            }

                            products.push({
                                cartItemId: item.id,
                                name: item.product.name,
                                id: item.product.id,
                                photoUrl: item.product.photoUrl || null,
                                quantity: item.quantity,
                                price: productPrice.toString(),
                                offer: item.product.offers && item.product.offers.length > 0 ? item.product.offers[0] : null,
                                addons: addons
                            });
                        } else if (item.type === 'combo' && item.combo) {
                            // Calculate combo price dynamically
                            const comboPrice = await calculateComboPrice(item.comboId);
                            
                            combos.push({
                                cartItemId: item.id,
                                name: item.combo.name,
                                id: item.combo.id,
                                price: comboPrice.toString(),
                                quantity: item.quantity
                            });
                        }
                    }

                    return {
                        resID: cart.restaurant.id,
                        resName: cart.restaurant.name,
                        isPlessing: cart.isPlessing || false,
                        products: products,
                        combo: combos
                    };
                })
        );
        res.status(200).json({
            // message: 'Carts retrieved successfully',
            // carts,
            // summary: {
            //     totalCarts: carts.length,
            //     overallTotalAmount,
            //     overallTotalItems
            // }
            carts: formattedCarts

        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

const updateCart = async (req, res) => {
    try {
        const { customerId, cartItemId, quantity, notes } = req.body;

        if (customerId!==req.user.customerId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!cartItemId) {
            return res.status(400).json({ message: 'Cart Item ID is required' });
        }

        if (quantity !== undefined && quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }

        // Find cart item by cartItemId
        const cartItem = await CartItem.findOne({
            where: {
                id: cartItemId,
                parentCartItemId: null,
                status: 'active',
                isActive: true
            },
            include: [{
                model: Cart,
                as: 'cart',
                where: {
                    customerId,
                    status: 'active',
                    isActive: true
                }
            }]
        });

        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        const cart = cartItem.cart;

        // Update cart item
        const updateData = { updatedBy: req.user.name };
        
        if (quantity !== undefined) {
            updateData.quantity = quantity;
            updateData.totalPrice = parseFloat(cartItem.unitPrice) * quantity;
            
            // Update addon quantities to match parent quantity
            await CartItem.update(
                {
                    quantity: quantity,
                    totalPrice: CartItem.sequelize.literal(`"unitPrice" * ${quantity}`),
                    updatedBy: req.user.name
                },
                {
                    where: {
                        parentCartItemId: cartItem.id,
                        status: 'active',
                        isActive: true
                    }
                }
            );
        }
        
        if (notes !== undefined) {
            updateData.notes = notes;
        }

        await cartItem.update(updateData);

        // Recalculate cart totals
        const cartItems = await CartItem.findAll({
            where: {
                cartId: cart.id,
                status: 'active',
                isActive: true
            }
        });

        let newTotalAmount = 0;
        let newTotalItems = 0;

        for (const item of cartItems) {
            newTotalAmount += parseFloat(item.totalPrice);
            newTotalItems += item.quantity;
        }

        await cart.update({
            totalAmount: newTotalAmount,
            totalItems: newTotalItems,
            updatedBy: req.user.name
        });

        // Fetch updated cart
        // const updatedCart = await Cart.findByPk(cart.id, {
        //     include: [
        //         {
        //             model: CartItem,
        //             as: 'items',
        //             where: { status: 'active', isActive: true },
        //             required: false,
        //             include: [
        //                 { model: Product, as: 'product' },
        //                 { model: Addon, as: 'addon' },
        //                 { model: Combo, as: 'combo' }
        //             ]
        //         },
        //         { model: Restaurant, as: 'restaurant' }
        //     ]
        // });

        res.status(200).json({
            message: 'Cart item updated successfully',
            // cart: updatedCart
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

const convertCartToOrder = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { customerId, restaurantId, addressId, paymentMethod, notes,isPlessing } = req.body;
        if (customerId !== req.user.customerId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!restaurantId) {
            return res.status(400).json({ message: 'Restaurant ID is required' });
        }

        // Validate payment method
        if (!paymentMethod || (paymentMethod !== 'cash' && paymentMethod !== 'digital' && paymentMethod !== 'friend')) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Payment method must be either "cash", "digital", or "friend"' });
        }

        if (!addressId) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Address ID is required' });
        }

        // Find active cart for this customer and restaurant with parent items only
        let cart
        if (isPlessing){
            cart = await Cart.findOne({
                where: {
                    customerId,
                    restaurantId,
                    status: 'active',
                    isPlessing:true,
                    isActive: true
                },
                include: [
                    {
                        model: CartItem,
                        as: 'items',
                        where: { 
                            status: 'active', 
                            isActive: true,
                            parentCartItemId: null  // Only get parent items
                        },
                        required: false,
                        include: [{
                            model: CartItem,
                            as: 'childItems',  // Include child addon items
                            where: { 
                                status: 'active', 
                                isActive: true 
                            },
                            required: false
                        }]
                    },{
                        model:Restaurant,
                        as:'restaurant',
                        attributes:['id', 'name', 'latitude', 'longitude']
                    }
                ]
            });
        }
        else{
            cart = await Cart.findOne({
                where: {
                    customerId,
                    restaurantId,
                    status: 'active',
                    isActive: true,
                    isPlessing:false
                },
                include: [
                    {
                        model: CartItem,
                        as: 'items',
                        where: { 
                            status: 'active', 
                            isActive: true,
                            parentCartItemId: null  // Only get parent items
                        },
                        required: false,
                        include: [{
                            model: CartItem,
                            as: 'childItems',  // Include child addon items
                            where: { 
                                status: 'active', 
                                isActive: true 
                            },
                            required: false
                        }]
                    },{
                        model:Restaurant,
                        as:'restaurant',
                        attributes:['id', 'name', 'latitude', 'longitude']
                    }
                ]
            });

        }

        if (!cart) {
            await transaction.rollback();
            return res.status(404).json({ message: 'No active cart found for this restaurant' });
        }

        if (!cart.items || cart.items.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // If cart is plessing, validate that all products have active plessing offers
        if (cart.isPlessing) {
            const currentDate = new Date();
            const productsWithoutPlessingOffer = [];
            
            for (const cartItem of cart.items) {
                if (cartItem.type === 'product' && cartItem.productId) {
                    const plessingOffer = await Offer.findOne({
                        where: {
                            productId: cartItem.productId,
                            isPleassing: true,
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
                        }
                    });
                    
                    if (!plessingOffer) {
                        // Get product details for error message
                        const product = await Product.findByPk(cartItem.productId, {
                            attributes: ['id', 'name']
                        });
                        productsWithoutPlessingOffer.push(product ? product.name : `Product ID ${cartItem.productId}`);
                    }
                }
            }
            
            if (productsWithoutPlessingOffer.length > 0) {
                await transaction.rollback();
                return res.status(400).json({ 
                    message: 'Cannot convert plessing cart to order. The following products do not have active plessing offers',
                    products: productsWithoutPlessingOffer
                });
            }
        }

        // Calculate order totals dynamically from source entities
        let subTotal = 0;
        let totalDiscountAmount = 0;

        for (const item of cart.items) {
            // Calculate prices dynamically based on cart's isPlessing flag
            const priceCalc = await calculateCartItemPrice(item, cart.isPlessing);
            subTotal += priceCalc.totalPrice;
        }

        // Get customer address
        const address = await Address.findOne({
            where: {
                id: addressId,
                customerId: customerId,
                status: 'active',
                isActive: true
            }
        });

        if (!address) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Address not found' });
        }

        // Get restaurant coordinates (prefer restaurant address coordinates)
        const restaurantData = cart.restaurant;

        const restaurantAddress = await Address.findOne({
            where: {
                restaurantId: cart.restaurantId,
                status: 'active',
                isActive: true
            }
        });

        const restLat = parseFloat(restaurantAddress?.latitude ?? restaurantData.latitude);
        const restLng = parseFloat(restaurantAddress?.longitude ?? restaurantData.longitude);

        if (isNaN(restLat) || isNaN(restLng)) {
            await transaction.rollback();
            return res.status(400).json({
                message: 'Restaurant location not configured',
                debug: {
                    restaurantId: cart.restaurantId,
                    restaurantName: restaurantData?.name,
                    restaurantAddressId: restaurantAddress?.id,
                    latitudeFromRestaurantAddress: restaurantAddress?.latitude,
                    longitudeFromRestaurantAddress: restaurantAddress?.longitude,
                    latitudeFromRestaurant: restaurantData?.latitude,
                    longitudeFromRestaurant: restaurantData?.longitude
                }
            });
        }

        // Calculate distance between address and restaurant
        const distance = calculateDistance(
            parseFloat(address.latitude),
            parseFloat(address.longitude),
            restLat,
            restLng
        );

        // Get pricing configs
        const configs = await Config.findAll({
            where: {
                name: ['baseKm', 'basePrice', 'afterBasePrice', 'systemFees'],
                status: 'active'
            }
        });

        const configMap = {};
        configs.forEach(config => {
            configMap[config.name] = parseFloat(config.value);
        });

        const baseKm = configMap['baseKm'] || 2;
        const basePrice = configMap['basePrice'] || 40;
        const afterBasePrice = configMap['afterBasePrice'] || 25;
        const systemFees = configMap['systemFees'] || 40;

        // Calculate delivery fee based on distance
        const deliveryFee = calculateDeliveryPrice(distance, baseKm, basePrice, afterBasePrice);
        const shippingAmount = deliveryFee + systemFees;
        const totalAmount = subTotal + shippingAmount;

        // Generate unique order number
        const orderNumber = `ORD-${Date.now()}-${customerId}`; 

        // Determine order status based on payment method
        // Digital payments start as 'unpaid' until payment succeeds
        // Cash payments go directly to 'pending' and marked as 'paid' (cash on delivery)
        // Friend payments start as 'unpaid' until friend completes payment
        const orderStatus = (paymentMethod === 'digital' || paymentMethod === 'friend') ? 'unpaid' : 'pending';
        const orderPaymentStatus = (paymentMethod === 'digital' || paymentMethod === 'friend') ? 'pending' : 'paid';

        // Create Order within transaction (without fcode first)
        const order = await Order.create({
            customerId,
            orderNumber,
            paymentStatus: orderPaymentStatus,
            paymentMethod: paymentMethod || null,
            totalAmount: totalAmount,
            subTotal: subTotal,
            discountAmount: totalDiscountAmount,
            shippingAmount: shippingAmount,
            cartId: cart.id,
            restaurantId:cart.restaurantId,
            restaurantName:cart.restaurant.name,
            notes: notes || null,
            addressId: addressId || cart.addressId,
            deliveryStatus: (paymentMethod === 'digital' || paymentMethod === 'friend') ? 'awaiting_payment' : 'pending',
            status: orderStatus,
            isActive: true,
            isPlessing: cart.isPlessing || false,  // Copy isPlessing flag from cart
            createdBy: req.user.name,
            updatedBy: req.user.name
        }, { transaction });

        // Generate FCODE: orderId-9randomChars
        const generateRandomChars = (length) => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        };
        const fcode = `${order.id}-${generateRandomChars(9)}`;
        
        // Update order with fcode
        await order.update({ fcode }, { transaction });

        // Create OrderItems from CartItems (parent and child items)
        const orderItems = [];
        const currentDate = new Date();
        
        for (const cartItem of cart.items) {
            // Check if it's a combo or regular product
            const isCombo = cartItem.type === 'combo' && cartItem.comboId;
            
            let offerId = null;
            let unitPrice = 0;
            let totalPrice = 0;
            
            // Calculate prices dynamically based on item type
            if (cartItem.type === 'product' && cartItem.productId) {
                // Calculate product price dynamically
                unitPrice = await calculateProductPrice(cartItem.productId, cart.isPlessing);
                totalPrice = unitPrice * cartItem.quantity;
                
                // Fetch the active offer based on cart's isPlessing flag
                const activeOffer = await Offer.findOne({
                    where: {
                        productId: cartItem.productId,
                        isPleassing: cart.isPlessing || false,
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
                    }
                });
                
                if (activeOffer) {
                    offerId = activeOffer.id;
                }
            } else if (cartItem.type === 'combo' && cartItem.comboId) {
                // Calculate combo price dynamically
                unitPrice = await calculateComboPrice(cartItem.comboId);
                totalPrice = unitPrice * cartItem.quantity;
            }
            
            // Create parent order item
            const parentOrderItem = await OrderItem.create({
                orderId: order.id,
                productId: isCombo ? null : cartItem.productId,
                addonId: cartItem.addonId,
                comboId: isCombo ? cartItem.comboId : null,
                offerId: offerId,
                parentOrderItemId: null,
                quantity: cartItem.quantity,
                unitPrice: unitPrice,
                totalPrice: totalPrice,
                discountAmount: 0,
                notes: cartItem.notes,
                type: cartItem.type,
                productName: cartItem.productName,
                status: 'active',
                isActive: true,
                createdBy: req.user.name,
                updatedBy: req.user.name
            }, { transaction });
            
            orderItems.push(parentOrderItem);

            // Create child order items for addons
            if (cartItem.childItems && cartItem.childItems.length > 0) {
                for (const childItem of cartItem.childItems) {
                    const isChildCombo = childItem.type === 'combo' && childItem.comboId;
                    
                    // Calculate addon price dynamically
                    let childUnitPrice = 0;
                    let childTotalPrice = 0;
                    
                    if (childItem.type === 'addon' && childItem.addonId) {
                        childUnitPrice = await calculateAddonPrice(childItem.addonId);
                        childTotalPrice = childUnitPrice * childItem.quantity;
                    }
                    
                    const childOrderItem = await OrderItem.create({
                        orderId: order.id,
                        productId: isChildCombo ? null : childItem.productId,
                        addonId: childItem.addonId,
                        comboId: isChildCombo ? childItem.comboId : null,
                        parentOrderItemId: parentOrderItem.id,
                        quantity: childItem.quantity,
                        unitPrice: childUnitPrice,
                        totalPrice: childTotalPrice,
                        discountAmount: 0,
                        notes: childItem.notes,
                        type: childItem.type,
                        productName: childItem.productName,
                        status: 'active',
                        isActive: true,
                        createdBy: req.user.name,
                        updatedBy: req.user.name
                    }, { transaction });
                    
                    orderItems.push(childOrderItem);
                }
            }
        }

        // Update cart status within transaction
        await cart.update({
            status: 'ordered',
            isActive: false,
            addressId: addressId || cart.addressId,
            updatedBy: req.user.name
        }, { transaction });

        // Update all cart items status (both parent and child items)
        await CartItem.update(
            {
                status: 'ordered',
                updatedBy: req.user.name
            },
            {
                where: {
                    cartId: cart.id,
                    status: 'active'
                },
                transaction
            }
        );

        // Commit transaction
        await transaction.commit();

        // If payment method is digital, initiate Paymob payment
        let paymobData = null;
        if (paymentMethod === 'digital') {
            try {
                // Get customer details for billing data
                const customer = await Customer.findByPk(customerId);
                const address = await Address.findByPk(addressId);

                const billingData = {
                    email: customer.email || 'customer@example.com',
                    first_name: customer.name ? customer.name.split(' ')[0] : 'Customer',
                    last_name: customer.name ? customer.name.split(' ').slice(1).join(' ') : '',
                    phone_number: customer.phoneNumber || '01000000000',
                    street: address?.street || 'N/A',
                    building: address?.building || 'N/A',
                    floor: address?.floor || 'N/A',
                    apartment: address?.apartment || 'N/A',
                    city: address?.city || 'Cairo',
                    country: 'EG',
                    postal_code: address?.postalCode || '00000'
                };

                // Initiate Paymob payment
                const paymobOrder = await paymobService.registerOrder({
                    amount_cents: Math.round(totalAmount * 100),
                    currency: 'EGP',
                    merchant_order_id: order.id
                });

                const paymentKey = await paymobService.generatePaymentKey({
                    amount_cents: Math.round(totalAmount * 100),
                    currency: 'EGP',
                    order_id: paymobOrder.id,
                    billing_data: billingData
                });

                // Create PayMobOrder record so webhook can find and update the Order
                await PayMobOrder.create({
                    orderId: order.id,
                    customerId: customerId,
                    paymobOrderId: paymobOrder.id.toString(),
                    amount: totalAmount,
                    amountCents: Math.round(totalAmount * 100),
                    currency: 'EGP',
                    paymentKey: paymentKey,
                    billingData: billingData,
                    status: 'pending',
                    paymentStatus: 'pending',
                    createdBy: `customer:${customerId}`
                });

                paymobData = {
                    iframe_url: `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`,
                    payment_token: paymentKey,
                    paymob_order_id: paymobOrder.id
                };

                console.log(`Paymob payment initiated for order ${order.id}`);
            } catch (paymobError) {
                console.error('Failed to initiate Paymob payment:', paymobError);
                // Don't fail the order creation, but log the error
                // Order remains in 'unpaid' status and customer can retry payment
            }
        }

        // Fetch restaurant to send notification
        const restaurant = await Restaurant.findByPk(restaurantId);
        
        // Send notification to restaurant only for cash orders or paid digital orders
        // For unpaid digital orders, notification will be sent after successful payment
        if (restaurant && restaurant.fcmToken && paymentMethod === 'cash') {
            try {
                await sendNotificationToToken({
                    token: restaurant.fcmToken,
                    title: 'طلب جديد',
                    body: `لديك طلب جديد في الانتظار`,
                    data: {
                        screen: 'restaurantOrderScreen',
                        
                    }
                });
                console.log(`Notification sent to restaurant ${restaurant.id} for new order ${order.id}`);
            } catch (notificationError) {
                console.error('Failed to send notification to restaurant:', notificationError);
                
                // If token is invalid, clear it from database
                if (notificationError.code === 'messaging/invalid-registration-token' ||
                    notificationError.code === 'messaging/registration-token-not-registered') {
                    await restaurant.update({ fcmToken: null });
                    console.log(`Cleared invalid FCM token for restaurant ${restaurant.id}`);
                }
            }
        } else {
            console.log(`Restaurant ${restaurantId} does not have FCM token, skipping notification`);
        }

        // Return response based on payment method
        if (paymentMethod === 'digital') {
            res.status(201).json({
                message: 'Order created successfully. Please complete payment.',
                order: {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    status: order.status,
                    paymentStatus: order.paymentStatus,
                    totalAmount: order.totalAmount
                },
                payment: paymobData || { error: 'Failed to initiate payment. Please contact support.' }
            });
        } else if (paymentMethod === 'friend') {
            const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
            const friendPaymentUrl = `${baseUrl}/api/orders/friend-payment/${order.fcode}`;
            const friendPaymentDeepLink = `${baseUrl}/api/deeplink/friend-payment/${order.fcode}`;
            
            res.status(201).json({
                message: 'Order created successfully. Share the payment link with your friend.',
                order: {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    fcode: order.fcode,
                    status: order.status,
                    paymentStatus: order.paymentStatus,
                    totalAmount: order.totalAmount
                },
                friendPaymentUrl: friendPaymentUrl,
                friendPaymentDeepLink: friendPaymentDeepLink
            });
        } else {
            res.status(201).json({
                message: 'Order created successfully',
                order: {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    status: order.status,
                    paymentStatus: order.paymentStatus,
                    totalAmount: order.totalAmount
                }
            });
        }
    } catch (error) {
        // Rollback transaction on error
        await transaction.rollback();
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

const getCheckoutInfo = async (req, res) => {
    try {
        const { customerId, restaurantId, isPlessing, addressId } = req.body;
        
        if (customerId !== req.user.customerId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!restaurantId) {
            return res.status(400).json({ message: 'Restaurant ID is required' });
        }

        if (!addressId) {
            return res.status(400).json({ message: 'Address ID is required' });
        }

        // Find active cart for this customer and restaurant
        let cart;
        if (isPlessing) {
            cart = await Cart.findOne({
                where: {
                    customerId,
                    restaurantId,
                    status: 'active',
                    isPlessing: true,
                    isActive: true
                },
                include: [
                    {
                        model: CartItem,
                        as: 'items',
                        where: { 
                            status: 'active', 
                            isActive: true,
                            parentCartItemId: null
                        },
                        required: false,
                        include: [{
                            model: CartItem,
                            as: 'childItems',
                            where: { 
                                status: 'active', 
                                isActive: true 
                            },
                            required: false
                        }]
                    },
                    {
                        model: Restaurant,
                        as: 'restaurant',
                        attributes: ['id', 'name', 'latitude', 'longitude']
                    }
                ]
            });
        } else {
            cart = await Cart.findOne({
                where: {
                    customerId,
                    restaurantId,
                    status: 'active',
                    isActive: true,
                    isPlessing: false
                },
                include: [
                    {
                        model: CartItem,
                        as: 'items',
                        where: { 
                            status: 'active', 
                            isActive: true,
                            parentCartItemId: null
                        },
                        required: false,
                        include: [{
                            model: CartItem,
                            as: 'childItems',
                            where: { 
                                status: 'active', 
                                isActive: true 
                            },
                            required: false
                        }]
                    },
                    {
                        model: Restaurant,
                        as: 'restaurant',
                        attributes: ['id', 'name', 'latitude', 'longitude']
                    }
                ]
            });
        }

        if (!cart) {
            return res.status(404).json({ message: 'No active cart found for this restaurant' });
        }

        if (!cart.items || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // If cart is plessing, validate that all products have active plessing offers
        if (cart.isPlessing) {
            const currentDate = new Date();
            const productsWithoutPlessingOffer = [];
            
            for (const cartItem of cart.items) {
                if (cartItem.type === 'product' && cartItem.productId) {
                    const plessingOffer = await Offer.findOne({
                        where: {
                            productId: cartItem.productId,
                            isPleassing: true,
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
                        }
                    });
                    
                    if (!plessingOffer) {
                        const product = await Product.findByPk(cartItem.productId, {
                            attributes: ['id', 'name']
                        });
                        productsWithoutPlessingOffer.push(product ? product.name : `Product ID ${cartItem.productId}`);
                    }
                }
            }
            
            if (productsWithoutPlessingOffer.length > 0) {
                return res.status(400).json({ 
                    message: 'Cannot checkout plessing cart. The following products do not have active plessing offers',
                    products: productsWithoutPlessingOffer
                });
            }
        }

        // Calculate order totals dynamically from source entities
        let subTotal = 0;
        const itemsBreakdown = [];

        for (const item of cart.items) {
            // Calculate prices dynamically based on cart's isPlessing flag
            const priceCalc = await calculateCartItemPrice(item, cart.isPlessing);
            subTotal += priceCalc.totalPrice;
            
            // Build item breakdown
            const itemDetail = {
                cartItemId: item.id,
                type: item.type,
                productId: item.productId,
                comboId: item.comboId,
                quantity: item.quantity,
                unitPrice: priceCalc.unitPrice,
                totalPrice: priceCalc.totalPrice,
                addons: []
            };

            // Add addon details if any
            if (item.childItems && item.childItems.length > 0) {
                for (const childItem of item.childItems) {
                    if (childItem.type === 'addon' && childItem.addonId) {
                        const addonPrice = await calculateAddonPrice(childItem.addonId);
                        itemDetail.addons.push({
                            addonId: childItem.addonId,
                            quantity: childItem.quantity,
                            unitPrice: addonPrice,
                            totalPrice: addonPrice * childItem.quantity
                        });
                    }
                }
            }

            itemsBreakdown.push(itemDetail);
        }

        // Get customer address
        const address = await Address.findOne({
            where: {
                id: addressId,
                customerId: customerId,
                status: 'active',
                isActive: true
            }
        });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // Get restaurant coordinates (prefer restaurant address coordinates)
        const restaurant = cart.restaurant;

        const restaurantAddress = await Address.findOne({
            where: {
                restaurantId: cart.restaurantId,
                status: 'active',
                isActive: true
            }
        });

        const restLat = parseFloat(restaurantAddress?.latitude ?? restaurant.latitude);
        const restLng = parseFloat(restaurantAddress?.longitude ?? restaurant.longitude);

        if (isNaN(restLat) || isNaN(restLng)) {
            return res.status(400).json({
                message: 'Restaurant location not configured',
                debug: {
                    restaurantId: cart.restaurantId,
                    restaurantName: restaurant?.name,
                    restaurantAddressId: restaurantAddress?.id,
                    latitudeFromRestaurantAddress: restaurantAddress?.latitude,
                    longitudeFromRestaurantAddress: restaurantAddress?.longitude,
                    latitudeFromRestaurant: restaurant?.latitude,
                    longitudeFromRestaurant: restaurant?.longitude
                }
            });
        }

        // Calculate distance between address and restaurant
        const distance = calculateDistance(
            parseFloat(address.latitude),
            parseFloat(address.longitude),
            restLat,
            restLng
        );

        // Get pricing configs
        const configs = await Config.findAll({
            where: {
                name: ['baseKm', 'basePrice', 'afterBasePrice', 'systemFees'],
                status: 'active'
            }
        });

        const configMap = {};
        configs.forEach(config => {
            configMap[config.name] = parseFloat(config.value);
        });

        const baseKm = configMap['baseKm'] || 2;
        const basePrice = configMap['basePrice'] || 40;
        const afterBasePrice = configMap['afterBasePrice'] || 25;
        const systemFees = configMap['systemFees'] || 40;

        // Calculate delivery fee based on distance
        const deliveryFee = calculateDeliveryPrice(distance, baseKm, basePrice, afterBasePrice);
        const shippingAmount = deliveryFee + systemFees;
        const totalAmount = subTotal + shippingAmount;
        const totalDiscountAmount = 0;

        // Return checkout information
        return res.status(200).json({
            message: 'Checkout information retrieved successfully',
            checkout: {
                restaurantId: cart.restaurantId,
                restaurantName: cart.restaurant.name,
                isPlessing: cart.isPlessing || false,
                itemsCount: cart.items.length,
                subTotal: parseFloat(subTotal.toFixed(2)),
                discountAmount: parseFloat(totalDiscountAmount.toFixed(2)),
                deliveryFee: parseFloat(deliveryFee.toFixed(2)),
                systemFees: parseFloat(systemFees.toFixed(2)),
                shippingAmount: parseFloat(shippingAmount.toFixed(2)),
                totalAmount: parseFloat(totalAmount.toFixed(2)),
                distance: parseFloat(distance.toFixed(2)),
                itemsBreakdown: itemsBreakdown
            }
        });
    } catch (error) {
        console.error('Get checkout info error:', error);
        return res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
};

module.exports = {
    addProductToCart,
    addPless,
    removeProductFromCart,
    clearCart,
    getCart,
    updateCart,
    convertCartToOrder,
    getCheckoutInfo
};