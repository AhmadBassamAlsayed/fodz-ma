const { Order, OrderItem, Customer, Address, Product, Addon, Cart, Offer, Restaurant, Combo, ComboItem, DeliveryMan, Config, sequelize } = require('../../models');
const { Op } = require('sequelize');
const { sendNotificationToToken } = require('../utils/firebase');
const paymobService = require('../services/paymob');

// Helper function to format orders for restaurant
const formatOrdersForRestaurant = async (orders) => {
    const formattedOrders = [];

    for (const order of orders) {
        // Get customer details
        const customer = await Customer.findByPk(order.customerId, {
            attributes: ['name']
        });

        const customerFullName = customer
            ? customer.name
            : 'Unknown Customer';

        // Get restaurant name from cart
        let restaurantName = 'Unknown Restaurant';
        if (order.cart && order.cart.restaurantId) {
            const restaurant = await Restaurant.findByPk(order.cart.restaurantId, {
                attributes: ['name']
            });
            restaurantName = restaurant ? restaurant.name : 'Unknown Restaurant';
        }

        // Calculate total quantity of products and combos
        let totalQuantity = 0;
        const productsList = [];
        const combosList = [];

        for (const item of order.items) {
            if (item.type === 'product' && item.productId) {
                totalQuantity += item.quantity;

                // Get product details
                const product = await Product.findByPk(item.productId, {
                    attributes: ['name', 'salePrice']
                });

                // Get offer from offerId if it exists
                let offer = null;
                if (item.offerId) {
                    offer = await Offer.findByPk(item.offerId);
                }

                // Get addons for this specific order item using parentOrderItemId
                const addons = await OrderItem.findAll({
                    where: {
                        parentOrderItemId: item.id,
                        type: 'addon',
                        isActive: true
                    },
                    include: [{
                        model: Addon,
                        as: 'addon',
                        attributes: ['name', 'salePrice']
                    }]
                });

                const addonNames = addons
                    .filter(a => a.addon)
                    .map(a => a.addon.name);

                productsList.push({
                    productName: product ? product.name : 'Unknown Product',
                    quantity: item.quantity,
                    orderItemNote: item.notes || null,
                    offer: offer,
                    addons: addonNames
                });
            } else if (item.type === 'combo' && item.comboId) {
                totalQuantity += item.quantity;

                // Get combo details with its products
                const combo = await Combo.findByPk(item.comboId, {
                    attributes: ['name', 'price', 'description'],
                    include: [{
                        model: ComboItem,
                        as: 'items',
                        attributes: ['quantity'],
                        include: [{
                            model: Product,
                            as: 'product',
                            attributes: ['name']
                        }]
                    }]
                });

                // Get addons for this specific order item using parentOrderItemId
                const addons = await OrderItem.findAll({
                    where: {
                        parentOrderItemId: item.id,
                        type: 'addon',
                        isActive: true
                    },
                    include: [{
                        model: Addon,
                        as: 'addon',
                        attributes: ['name', 'salePrice']
                    }]
                });

                const addonNames = addons
                    .filter(a => a.addon)
                    .map(a => a.addon.name);

                // Build products list for the combo
                const comboProducts = combo && combo.items
                    ? combo.items.map(ci => ({
                        name: ci.product ? ci.product.name : 'Unknown Product',
                        quantity: ci.quantity
                    }))
                    : [];

                combosList.push({
                    comboName: combo ? combo.name : 'Unknown Combo',
                    quantity: item.quantity,
                    orderItemNote: item.notes || null,
                    addons: addonNames,
                    products: comboProducts
                });
            }
        }

        // Calculate total with offers and addons
        let totalAmount = parseFloat(order.totalAmount) || 0;

        formattedOrders.push({
            photoUrl: null,
            userFullName: customerFullName,
            restaurantName: restaurantName,
            orderCreatingDate: order.createdAt,
            orderId: order.id,
            fcode: order.fcode || null,
            isPlessing: order.isPlessing || false,
            status: order.status,
            denialReason: order.status === 'denied' ? order.notes : undefined,
            totalQuantity: totalQuantity,
            products: productsList,
            combos: combosList,
            totalAmount: totalAmount.toFixed(2)
        });
    }

    return formattedOrders;
};

// Helper function to format orders for customer
const formatOrdersForCustomer = async (orders) => {
    const formattedOrders = [];

    for (const order of orders) {
        // Get restaurant name from cart
        let restaurantName = 'Unknown Restaurant';
        if (order.cartId) {
            const cart = await Cart.findByPk(order.cartId, {
                attributes: ['restaurantId'],
                include: [{
                    model: Restaurant,
                    as: 'restaurant',
                    attributes: ['name']
                }]
            });
            restaurantName = cart && cart.restaurant ? cart.restaurant.name : 'Unknown Restaurant';
        }

        // Calculate total quantity of products and combos
        let totalQuantity = 0;
        const productsList = [];
        const combosList = [];

        for (const item of order.items) {
            if (item.type === 'product' && item.productId) {
                totalQuantity += item.quantity;

                // Get product details
                const product = await Product.findByPk(item.productId, {
                    attributes: ['name', 'salePrice']
                });

                // Get offer from offerId if it exists
                let offer = null;
                if (item.offerId) {
                    offer = await Offer.findByPk(item.offerId);
                }

                // Get addons for this specific order item using parentOrderItemId
                const addons = await OrderItem.findAll({
                    where: {
                        parentOrderItemId: item.id,
                        type: 'addon',
                        isActive: true
                    },
                    include: [{
                        model: Addon,
                        as: 'addon',
                        attributes: ['name', 'salePrice']
                    }]
                });

                const addonNames = addons
                    .filter(a => a.addon)
                    .map(a => a.addon.name);

                productsList.push({
                    productName: product ? product.name : 'Unknown Product',
                    quantity: item.quantity,
                    orderItemNote: item.notes || null,
                    offer: offer,
                    addons: addonNames
                });
            } else if (item.type === 'combo' && item.comboId) {
                totalQuantity += item.quantity;

                // Get combo details with its products
                const combo = await Combo.findByPk(item.comboId, {
                    attributes: ['name', 'price', 'description'],
                    include: [{
                        model: ComboItem,
                        as: 'items',
                        attributes: ['quantity'],
                        include: [{
                            model: Product,
                            as: 'product',
                            attributes: ['name']
                        }]
                    }]
                });

                // Get addons for this specific order item using parentOrderItemId
                const addons = await OrderItem.findAll({
                    where: {
                        parentOrderItemId: item.id,
                        type: 'addon',
                        isActive: true
                    },
                    include: [{
                        model: Addon,
                        as: 'addon',
                        attributes: ['name', 'salePrice']
                    }]
                });

                const addonNames = addons
                    .filter(a => a.addon)
                    .map(a => a.addon.name);

                // Build products list for the combo
                const comboProducts = combo && combo.items
                    ? combo.items.map(ci => ({
                        name: ci.product ? ci.product.name : 'Unknown Product',
                        quantity: ci.quantity
                    }))
                    : [];

                combosList.push({
                    comboName: combo ? combo.name : 'Unknown Combo',
                    quantity: item.quantity,
                    orderItemNote: item.notes || null,
                    addons: addonNames,
                    products: comboProducts
                });
            }
        }

        // Calculate total with offers and addons
        let totalAmount = parseFloat(order.totalAmount) || 0;

        formattedOrders.push({
            photoUrl: null,
            restaurantName: restaurantName,
            orderCreatingDate: order.createdAt,
            orderId: order.id,
            fcode: order.fcode || null,
            isPlessing: order.isPlessing || false,
            status: order.status,
            denialReason: order.status === 'denied' ? order.notes : undefined,
            totalQuantity: totalQuantity,
            products: productsList,
            combos: combosList,
            totalAmount: totalAmount.toFixed(2)
        });
    }

    return formattedOrders;
};

// Get pending orders for a customer or restaurant
const getPendingOrders = async (req, res) => {
    try {
        const { customerId, restaurantId } = req.params;

        // Validate that params are numbers
        if (customerId && isNaN(parseInt(customerId))) {
            return res.status(400).json({ message: 'Customer ID must be a valid number' });
        }
        if (restaurantId && isNaN(parseInt(restaurantId))) {
            return res.status(400).json({ message: 'Restaurant ID must be a valid number' });
        }

        const whereClause = {
            status: 'pending',
            isActive: true
        };

        const includeClause = [
            {
                model: OrderItem,
                as: 'items',
                where: { isActive: true },
                required: false
            },
            {
                model: Address,
                as: 'address',
                required: false
            }
        ];
        if (req.user.role === 'restaurant' && restaurantId) {
            includeClause.push({
                model: Cart,
                as: 'cart',
                where: { restaurantId: parseInt(restaurantId) },
                required: true
            });
        } else if (customerId) {
            whereClause.customerId = parseInt(customerId);
        } else {
            return res.status(400).json({ message: 'Customer ID or Restaurant ID is required' });
        }

        const orders = await Order.findAll({
            where: whereClause,
            include: includeClause,
            order: [['createdAt', 'DESC']]
        });

        // Format response for restaurant
        if (req.user.role === 'restaurant' && restaurantId) {
            const formattedOrders = await formatOrdersForRestaurant(orders);
            return res.status(200).json({
                message: 'Pending orders retrieved successfully',
                count: formattedOrders.length,
                orders: formattedOrders
            });
        }

        // Format response for customers
        if (customerId) {
            const formattedOrders = await formatOrdersForCustomer(orders);
            return res.status(200).json({
                message: 'Pending orders retrieved successfully',
                count: formattedOrders.length,
                orders: formattedOrders
            });
        }

        // Default response
        res.status(200).json({
            message: 'Pending orders retrieved successfully',
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

// Get accepted orders for a customer or restaurant
const getAcceptedOrders = async (req, res) => {
    try {
        const { customerId, restaurantId } = req.params;

        // Validate that params are numbers
        if (customerId && isNaN(parseInt(customerId))) {
            return res.status(400).json({ message: 'Customer ID must be a valid number' });
        }
        if (restaurantId && isNaN(parseInt(restaurantId))) {
            return res.status(400).json({ message: 'Restaurant ID must be a valid number' });
        }

        const whereClause = {
            status: 'accepted',
            isActive: true
        };

        const includeClause = [
            {
                model: OrderItem,
                as: 'items',
                where: { isActive: true },
                required: false
            },
            {
                model: Address,
                as: 'address',
                required: false
            }
        ];

        if (req.user.role === 'restaurant' && restaurantId) {
            includeClause.push({
                model: Cart,
                as: 'cart',
                where: { restaurantId: parseInt(restaurantId) },
                required: true
            });
        } else if (customerId) {
            whereClause.customerId = parseInt(customerId);
        } else {
            return res.status(400).json({ message: 'Customer ID or Restaurant ID is required' });
        }

        const orders = await Order.findAll({
            where: whereClause,
            include: includeClause,
            order: [['createdAt', 'DESC']]
        });

        // Format response for restaurant
        if (req.user.role === 'restaurant' && restaurantId) {
            const formattedOrders = await formatOrdersForRestaurant(orders);
            return res.status(200).json({
                message: 'Accepted orders retrieved successfully',
                count: formattedOrders.length,
                orders: formattedOrders
            });
        }

        // Format response for customers
        if (customerId) {
            const formattedOrders = await formatOrdersForCustomer(orders);
            return res.status(200).json({
                message: 'Accepted orders retrieved successfully',
                count: formattedOrders.length,
                orders: formattedOrders
            });
        }

        res.status(200).json({
            message: 'Accepted orders retrieved successfully',
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

// Get shipped orders for a customer or restaurant
const getShippedOrders = async (req, res) => {
    try {
        const { customerId, restaurantId } = req.params;

        // Validate that params are numbers
        if (customerId && isNaN(parseInt(customerId))) {
            return res.status(400).json({ message: 'Customer ID must be a valid number' });
        }
        if (restaurantId && isNaN(parseInt(restaurantId))) {
            return res.status(400).json({ message: 'Restaurant ID must be a valid number' });
        }

        const whereClause = {
            status: 'shipped',
            isActive: true
        };

        const includeClause = [
            {
                model: OrderItem,
                as: 'items',
                where: { isActive: true },
                required: false
            },
            {
                model: Address,
                as: 'address',
                required: false
            }
        ];

        if (req.user.role === 'restaurant' && restaurantId) {
            includeClause.push({
                model: Cart,
                as: 'cart',
                where: { restaurantId: parseInt(restaurantId) },
                required: true
            });
        } else if (customerId) {
            whereClause.customerId = parseInt(customerId);
        } else {
            return res.status(400).json({ message: 'Customer ID or Restaurant ID is required' });
        }

        const orders = await Order.findAll({
            where: whereClause,
            include: includeClause,
            order: [['createdAt', 'DESC']]
        });

        // Format response for restaurant
        if (req.user.role === 'restaurant' && restaurantId) {
            const formattedOrders = await formatOrdersForRestaurant(orders);
            return res.status(200).json({
                message: 'Shipped orders retrieved successfully',
                count: formattedOrders.length,
                orders: formattedOrders
            });
        }

        // Format response for customers
        if (customerId) {
            const formattedOrders = await formatOrdersForCustomer(orders);
            return res.status(200).json({
                message: 'Shipped orders retrieved successfully',
                count: formattedOrders.length,
                orders: formattedOrders
            });
        }

        res.status(200).json({
            message: 'Shipped orders retrieved successfully',
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

// Get completed orders for a customer or restaurant
const getCompletedOrders = async (req, res) => {
    try {
        const { customerId, restaurantId } = req.params;

        // Validate that params are numbers
        if (customerId && isNaN(parseInt(customerId))) {
            return res.status(400).json({ message: 'Customer ID must be a valid number' });
        }
        if (restaurantId && isNaN(parseInt(restaurantId))) {
            return res.status(400).json({ message: 'Restaurant ID must be a valid number' });
        }

        const whereClause = {
            status: 'completed',
            isActive: true
        };

        const includeClause = [
            {
                model: OrderItem,
                as: 'items',
                where: { isActive: true },
                required: false
            },
            {
                model: Address,
                as: 'address',
                required: false
            }
        ];

        if (req.user.role === 'restaurant' && restaurantId) {
            includeClause.push({
                model: Cart,
                as: 'cart',
                where: { restaurantId: parseInt(restaurantId) },
                required: true
            });
        } else if (customerId) {
            whereClause.customerId = parseInt(customerId);
        } else {
            return res.status(400).json({ message: 'Customer ID or Restaurant ID is required' });
        }

        const orders = await Order.findAll({
            where: whereClause,
            include: includeClause,
            order: [['createdAt', 'DESC']]
        });

        // Format response for restaurant
        if (req.user.role === 'restaurant' && restaurantId) {
            const formattedOrders = await formatOrdersForRestaurant(orders);
            return res.status(200).json({
                message: 'Completed orders retrieved successfully',
                count: formattedOrders.length,
                orders: formattedOrders
            });
        }

        // Format response for customers
        if (customerId) {
            const formattedOrders = await formatOrdersForCustomer(orders);
            return res.status(200).json({
                message: 'Completed orders retrieved successfully',
                count: formattedOrders.length,
                orders: formattedOrders
            });
        }

        res.status(200).json({
            message: 'Completed orders retrieved successfully',
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

// Get denied orders for a customer or restaurant
const getDeniedOrders = async (req, res) => {
    try {
        const { customerId, restaurantId } = req.params;

        // Validate that params are numbers
        if (customerId && isNaN(parseInt(customerId))) {
            return res.status(400).json({ message: 'Customer ID must be a valid number' });
        }
        if (restaurantId && isNaN(parseInt(restaurantId))) {
            return res.status(400).json({ message: 'Restaurant ID must be a valid number' });
        }

        const whereClause = {
            status: 'denied',
            isActive: true
        };

        const includeClause = [
            {
                model: OrderItem,
                as: 'items',
                where: { isActive: true },
                required: false
            },
            {
                model: Address,
                as: 'address',
                required: false
            }
        ];

        if (req.user.role === 'restaurant' && restaurantId) {
            includeClause.push({
                model: Cart,
                as: 'cart',
                where: { restaurantId: parseInt(restaurantId) },
                required: true
            });
        } else if (customerId) {
            whereClause.customerId = parseInt(customerId);
        } else {
            return res.status(400).json({ message: 'Customer ID or Restaurant ID is required' });
        }

        const orders = await Order.findAll({
            where: whereClause,
            include: includeClause,
            order: [['createdAt', 'DESC']]
        });

        // Format response for restaurant
        if (req.user.role === 'restaurant' && restaurantId) {
            const formattedOrders = await formatOrdersForRestaurant(orders);
            return res.status(200).json({
                message: 'Denied orders retrieved successfully',
                count: formattedOrders.length,
                orders: formattedOrders
            });
        }

        // Format response for customers
        if (customerId) {
            const formattedOrders = await formatOrdersForCustomer(orders);
            return res.status(200).json({
                message: 'Denied orders retrieved successfully',
                count: formattedOrders.length,
                orders: formattedOrders
            });
        }

        res.status(200).json({
            message: 'Denied orders retrieved successfully',
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

// Get all orders for a customer or restaurant with pagination
const getAllOrders = async (req, res) => {
    try {
        const { customerId, restaurantId } = req.params;

        // Validate that params are numbers
        if (customerId && isNaN(parseInt(customerId))) {
            return res.status(400).json({ message: 'Customer ID must be a valid number' });
        }
        if (restaurantId && isNaN(parseInt(restaurantId))) {
            return res.status(400).json({ message: 'Restaurant ID must be a valid number' });
        }

        const whereClause = {
            status: { [Op.ne]: 'denied' },
            isActive: true
        };

        const includeClause = [
            {
                model: OrderItem,
                as: 'items',
                where: { isActive: true },
                required: false
            },
            {
                model: Address,
                as: 'address',
                required: false
            }
        ];

        if (req.user.role === 'restaurant' && restaurantId) {
            includeClause.push({
                model: Cart,
                as: 'cart',
                where: { restaurantId: parseInt(restaurantId) },
                required: true
            });
        } else if (customerId) {
            whereClause.customerId = parseInt(customerId);
        } else {
            return res.status(400).json({ message: 'Customer ID or Restaurant ID is required' });
        }

        const orders = await Order.findAll({
            where: whereClause,
            include: includeClause,
            order: [['createdAt', 'DESC']]
        });

        // Format response for restaurant
        if (req.user.role === 'restaurant' && restaurantId) {
            const formattedOrders = await formatOrdersForRestaurant(orders);
            return res.status(200).json({
                message: 'All orders retrieved successfully',
                count: formattedOrders.length,
                orders: formattedOrders
            });
        }

        // Format response for customers
        if (customerId) {
            const formattedOrders = await formatOrdersForCustomer(orders);
            return res.status(200).json({
                message: 'All orders retrieved successfully',
                count: formattedOrders.length,
                orders: formattedOrders
            });
        }

        res.status(200).json({
            message: 'All orders retrieved successfully',
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

// Accept or deny an order (only when status is pending)
const acceptOrDenyOrder = async (req, res) => {
    try {
        const { orderId, action, denialReason } = req.body;

        if (!orderId || !action) {
            return res.status(400).json({ message: 'Order ID and action are required' });
        }

        if (isNaN(parseInt(orderId))) {
            return res.status(400).json({ message: 'Order ID must be a valid number' });
        }

        if (action !== 'accept' && action !== 'deny') {
            return res.status(400).json({ message: 'Action must be either "accept" or "deny"' });
        }

        // Validate denialReason is provided when denying
        if (action === 'deny' && !denialReason) {
            return res.status(400).json({ message: 'Denial reason is required when denying an order' });
        }

        const order = await Order.findOne({
            where: {
                id: parseInt(orderId),
                isActive: true
            }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({
                message: `Cannot ${action} order. Order must be in pending status. Current status: ${order.status}`
            });
        }

        const newStatus = action === 'accept' ? 'accepted' : 'denied';

        // Update order with status and denial reason if denying
        const updateData = {
            status: newStatus,
            updatedBy: req.user.name
        };

        if (action === 'deny' && denialReason) {
            updateData.notes = denialReason;
        }

        await order.update(updateData);

        // Fetch customer to get FCM token
        const customer = await Customer.findByPk(order.customerId);

        // Send notification if customer has FCM token
        if (customer && customer.fcmToken) {
            try {
                if (action === 'accept') {
                    await sendNotificationToToken({
                        token: customer.fcmToken,
                        title: 'تم قبول طلبك',
                        body: `تم قبول طلبك من ${order.restaurantName}`,
                        data: {
                            screen: "customerAcceptedTap",
                        }
                    });
                } else {
                    await sendNotificationToToken({
                        token: customer.fcmToken,
                        title: 'تم رفض طلبك',
                        body: `تم رفض طلبك من ${order.restaurantName}. السبب: ${denialReason}`,
                        data: {
                            screen: "customerDeniedTap",
                        }
                    });
                }
                console.log(`Notification sent to customer ${customer.id} for order ${order.id}`);
            } catch (notificationError) {
                // Log error but don't fail the request
                console.error('Failed to send notification:', notificationError);

                // If token is invalid, clear it from database
                if (notificationError.code === 'messaging/invalid-registration-token' ||
                    notificationError.code === 'messaging/registration-token-not-registered') {
                    await customer.update({ fcmToken: null });
                    console.log(`Cleared invalid FCM token for customer ${customer.id}`);
                }
            }
        } else {
            console.log(`Customer ${order.customerId} does not have FCM token, skipping notification`);
        }

        res.status(200).json({
            message: `Order ${action}ed successfully`,
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                denialReason: action === 'deny' ? order.notes : undefined,
                updatedAt: order.updatedAt
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

// Complete an order (only when status is accepted)
const completeOrder = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ message: 'Order ID is required' });
        }

        if (isNaN(parseInt(orderId))) {
            return res.status(400).json({ message: 'Order ID must be a valid number' });
        }

        const order = await Order.findOne({
            where: {
                id: parseInt(orderId),
                isActive: true
            },
            include: [
                {
                    model: Restaurant,
                    as: 'restaurant',
                    attributes: ['name']
                }
            ]
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'accepted') {
            return res.status(400).json({
                message: `Cannot complete order. Order must be in accepted status. Current status: ${order.status}`
            });
        }

        await order.update({
            status: 'completed',
            updatedBy: req.user.name
        });

        // Fetch customer to send notification
        const customer = await Customer.findByPk(order.customerId);

        // Send notification if customer has FCM token
        if (customer && customer.fcmToken) {
            try {
                await sendNotificationToToken({
                    token: customer.fcmToken,
                    title: 'تم إنجاز طلبك',
                    body: `طلبك من #${order.restaurantName} جاهز للتوصيل`,
                    data: {
                        screen: 'customerInWaitingDeleviryTap'
                    }
                });
                console.log(`Notification sent to customer ${customer.id} for completed order ${order.id}`);
            } catch (notificationError) {
                console.error('Failed to send notification:', notificationError);

                // If token is invalid, clear it from database
                if (notificationError.code === 'messaging/invalid-registration-token' ||
                    notificationError.code === 'messaging/registration-token-not-registered') {
                    await customer.update({ fcmToken: null });
                    console.log(`Cleared invalid FCM token for customer ${customer.id}`);
                }
            }
        } else {
            console.log(`Customer ${order.customerId} does not have FCM token, skipping notification`);
        }

        // Get FCM tokens for all delivery men in the same city as the order address
        const orderAddress = await Address.findByPk(order.addressId);
        
        if (orderAddress && orderAddress.city) {
            // Find all active, verified delivery men in the same city
            const deliveryMenInCity = await DeliveryMan.findAll({
                where: {
                    isActive: true,
                    isVerified: true,
                    isDeleted: false,
                    status: 'active',
                    city: orderAddress.city,
                    fcmToken: {
                        [Op.ne]: null
                    }
                },
                attributes: ['id', 'name', 'fcmToken']
            });

            const deliveryMenTokens = deliveryMenInCity
                .filter((deliveryMan) => typeof deliveryMan.fcmToken === 'string' && deliveryMan.fcmToken.trim() !== '')
                .map((deliveryMan) => ({
                    id: deliveryMan.id,
                    name: deliveryMan.name,
                    fcmToken: deliveryMan.fcmToken
                }));

            // Send notifications to all delivery men in the same city
            if (deliveryMenTokens.length > 0) {
                console.log(`Found ${deliveryMenTokens.length} delivery men in city: ${orderAddress.city}`);
                
                for (const deliveryMan of deliveryMenTokens) {
                    try {
                        await sendNotificationToToken({
                            token: deliveryMan.fcmToken,
                            title: 'طلب جديد متاح',
                            body: `طلب جديد #${order.orderNumber} جاهز للتوصيل في ${orderAddress.city}`,
                            data: {
                                screen: 'availableOrders',
                                orderId: order.id.toString(),
                                orderNumber: order.orderNumber
                            }
                        });
                        console.log(`Notification sent to delivery man ${deliveryMan.id} (${deliveryMan.name})`);
                    } catch (notificationError) {
                        console.error(`Failed to send notification to delivery man ${deliveryMan.id}:`, notificationError);
                        
                        // If token is invalid, clear it from database
                        if (notificationError.code === 'messaging/invalid-registration-token' ||
                            notificationError.code === 'messaging/registration-token-not-registered') {
                            await DeliveryMan.update(
                                { fcmToken: null },
                                { where: { id: deliveryMan.id } }
                            );
                            console.log(`Cleared invalid FCM token for delivery man ${deliveryMan.id}`);
                        }
                    }
                }
            } else {
                console.log(`No delivery men with FCM tokens found in city: ${orderAddress.city}`);
            }
        } else {
            console.log('Order address not found or city not specified');
        }

        res.status(200).json({
            message: 'Order completed successfully',
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                updatedAt: order.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

// Ship an order (only when status is completed)
const shipOrder = async (req, res) => {
    try {
        const { orderId, deliveryManId } = req.body;

        if (!orderId) {
            return res.status(400).json({ message: 'Order ID is required' });
        }

        if (isNaN(parseInt(orderId))) {
            return res.status(400).json({ message: 'Order ID must be a valid number' });
        }

        if (deliveryManId && isNaN(parseInt(deliveryManId))) {
            return res.status(400).json({ message: 'Delivery Man ID must be a valid number' });
        }

        const order = await Order.findOne({
            where: {
                id: parseInt(orderId),
                isActive: true
            }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'completed') {
            return res.status(400).json({
                message: `Cannot ship order. Order must be in completed status. Current status: ${order.status}`
            });
        }

        await order.update({
            deliveryStatus: 'shipping',
            status: 'shipping',
            deliveryManId: deliveryManId ? parseInt(deliveryManId) : null,
            updatedBy: req.user.name
        });

        // Fetch customer to send notification
        const customer = await Customer.findByPk(order.customerId);

        // Send notification if customer has FCM token
        if (customer && customer.fcmToken) {
            try {
                await sendNotificationToToken({
                    token: customer.fcmToken,
                    title: 'تم شحن طلبك',
                    body: `الطلب من ${order.restaurantName} تم شحنه`,
                    data: {
                        screen: 'customerInDeleviryTap'
                    }
                });
                console.log(`Notification sent to customer ${customer.id} for shipped order ${order.id}`);
            } catch (notificationError) {
                console.error('Failed to send notification:', notificationError);

                // If token is invalid, clear it from database
                if (notificationError.code === 'messaging/invalid-registration-token' ||
                    notificationError.code === 'messaging/registration-token-not-registered') {
                    await customer.update({ fcmToken: null });
                    console.log(`Cleared invalid FCM token for customer ${customer.id}`);
                }
            }
        } else {
            console.log(`Customer ${order.customerId} does not have FCM token, skipping notification`);
        }

        res.status(200).json({
            message: 'Order shipped successfully',
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                deliveryStatus: order.deliveryStatus,
                deliveryManId: order.deliveryManId,
                updatedAt: order.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

// Cancel an order (only when status is pending)
const cancelOrder = async (req, res) => {
    try {
        const { orderId, customerId, reason } = req.body;

        if (!orderId || !customerId) {
            return res.status(400).json({ message: 'Order ID and customer ID are required' });
        }

        if (isNaN(parseInt(orderId))) {
            return res.status(400).json({ message: 'Order ID must be a valid number' });
        }

        if (isNaN(parseInt(customerId))) {
            return res.status(400).json({ message: 'Customer ID must be a valid number' });
        }

        const order = await Order.findOne({
            where: {
                id: parseInt(orderId),
                customerId: parseInt(customerId),
                isActive: true
            }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({
                message: `Cannot cancel order. Order can only be cancelled when in pending status. Current status: ${order.status}`
            });
        }

        await order.update({
            status: 'cancelled',
            notes: reason ? `${order.notes || ''}\nCancellation reason: ${reason}`.trim() : order.notes,
            updatedBy: req.user.name
        });

        // Fetch customer to send notification
        const customer = await Customer.findByPk(order.customerId);

        // Send notification if customer has FCM token
        if (customer && customer.fcmToken) {
            try {
                await sendNotificationToToken({
                    token: customer.fcmToken,
                    title: 'تم إلغاء طلبك',
                    body: reason ? `تم إلغاء طلبك #${order.orderNumber}. السبب: ${reason}` : `تم إلغاء طلبك #${order.orderNumber}`,
                    data: {
                        screen: 'customerCancelledTap'
                    }
                });
                console.log(`Notification sent to customer ${customer.id} for cancelled order ${order.id}`);
            } catch (notificationError) {
                console.error('Failed to send notification:', notificationError);

                // If token is invalid, clear it from database
                if (notificationError.code === 'messaging/invalid-registration-token' ||
                    notificationError.code === 'messaging/registration-token-not-registered') {
                    await customer.update({ fcmToken: null });
                    console.log(`Cleared invalid FCM token for customer ${customer.id}`);
                }
            }
        } else {
            console.log(`Customer ${order.customerId} does not have FCM token, skipping notification`);
        }

        res.status(200).json({
            message: 'Order cancelled successfully',
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                updatedAt: order.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

// Delivery Man: List completed orders without assigned delivery man
const listCompletedUnassignedOrders = async (req, res) => {
    try {
        if (!req.user.deliverymanId) {
            return res.status(400).json({ message: 'Delivery man not found in user session' });
        }
        const orders = await Order.findAll({
            where: {
                status: 'completed',
                deliveryManId: null,
                isActive: true,
                isDeleted: false
            },
            attributes: [
                'id',
                'orderNumber',
                'status',
                'deliveryStatus',
                'totalAmount',
                'createdAt',
                'customerId',
                'restaurantId'
            ],
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['id', 'name', 'phoneNumber']
                },
                {
                    model: Restaurant,
                    as: 'restaurant',
                    attributes: ['id', 'name']
                },
                {
                    model: Address,
                    as: 'address',
                    attributes: ['id', 'street', 'city', 'streetAddress', 'name']
                }
            ],
            order: [['createdAt', 'ASC']]
        });

        res.status(200).json({
            message: 'Completed unassigned orders retrieved successfully',
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

// Delivery Man: List orders assigned to specific delivery man
const listOrdersForDeliveryMan = async (req, res) => {
    try {
        const { deliveryManId } = req.query;

        if (!deliveryManId || isNaN(parseInt(deliveryManId))) {
            return res.status(400).json({ message: 'Valid delivery man ID is required' });
        }
        if (!req.user.deliverymanId) {
            return res.status(400).json({ message: 'Delivery man not found in user session' });
        }
        // Ensure the requesting delivery man matches the query param
        if (parseInt(deliveryManId) !== req.user.deliverymanId) {
            return res.status(403).json({ message: 'You can only view your own orders' });
        }

        const orders = await Order.findAll({
            where: {
                deliveryManId: parseInt(deliveryManId),
                isActive: true,
                isDeleted: false,
                status: 'shipping'
            },
            attributes: [
                'id',
                'orderNumber',
                'status',
                'deliveryStatus',
                'totalAmount',
                'createdAt',
                'updatedAt',
                'customerId',
                'restaurantId'
            ],
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['id', 'name', 'phoneNumber']
                },
                {
                    model: Restaurant,
                    as: 'restaurant',
                    attributes: ['id', 'name']
                },
                {
                    model: Address,
                    as: 'address',
                    attributes: ['id', 'street', 'city', 'streetAddress', 'name']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            message: 'Your orders retrieved successfully',
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

// Delivery Man: Mark order as shipping (accept delivery)
const markOrderShipping = async (req, res) => {
    try {
        const { deliveryManId } = req.query;
        const { orderId } = req.body;
        if (!req.user.deliverymanId) {
            return res.status(400).json({ message: 'Delivery man not found in user session' });
        }
        if (!deliveryManId || isNaN(parseInt(deliveryManId))) {
            return res.status(400).json({ message: 'Valid delivery man ID is required' });
        }

        if (!orderId || isNaN(parseInt(orderId))) {
            return res.status(400).json({ message: 'Valid order ID is required' });
        }

        // Ensure the requesting delivery man matches the query param
        if (parseInt(deliveryManId) !== req.user.deliverymanId) {
            return res.status(403).json({ message: 'Delivery man ID does not match your account' });
        }

        const order = await Order.findOne({
            where: {
                id: parseInt(orderId),
                isActive: true,
                isDeleted: false
            }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'completed') {
            return res.status(400).json({
                message: `Cannot accept order. Order must be in completed status. Current status: ${order.status}`
            });
        }

        await order.update({
            deliveryStatus: 'shipping',
            status: 'shipping',
            updatedBy: req.user.name
        });

        res.status(200).json({
            message: 'Order accepted for delivery successfully',
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                deliveryStatus: order.deliveryStatus,
                deliveryManId: order.deliveryManId,
                updatedAt: order.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

// Delivery Man: Mark order as shipped (delivery completed)
const markOrderShipped = async (req, res) => {
    try {
        const { deliveryManId } = req.query;
        const { orderId } = req.body;
        if (!req.user.deliverymanId) {
            return res.status(400).json({ message: 'Delivery man not found in user session' });
        } if (!req.user.deliverymanId) {
            return res.status(400).json({ message: 'Delivery man not found in user session' });
        }
        if (!deliveryManId || isNaN(parseInt(deliveryManId))) {
            return res.status(400).json({ message: 'Valid delivery man ID is required' });
        }

        if (!orderId || isNaN(parseInt(orderId))) {
            return res.status(400).json({ message: 'Valid order ID is required' });
        }

        // Ensure the requesting delivery man matches the query param
        if (parseInt(deliveryManId) !== req.user.deliverymanId) {
            return res.status(403).json({ message: 'Delivery man ID does not match your account' });
        }

        const order = await Order.findOne({
            where: {
                id: parseInt(orderId),
                deliveryManId: parseInt(deliveryManId),
                isActive: true,
                isDeleted: false
            }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found or not assigned to you' });
        }

        if (order.status !== 'shipping' && order.deliveryStatus !== 'shipping') {
            return res.status(400).json({
                message: `Cannot mark as shipped. Order must be in shipping status. Current status: ${order.status}`
            });
        }

        // Get restaurant to increase wallet
        const restaurant = await Restaurant.findByPk(order.restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Get system fees from config
        const systemFeesConfig = await Config.findOne({ where: { name: 'systemFees' } });
        const systemFees = systemFeesConfig ? parseFloat(systemFeesConfig.value) : 0;

        // Use database transaction to ensure atomicity
        const transaction = await sequelize.transaction();
        try {
            // Update order status
            await order.update({
                deliveryStatus: 'shipped',
                status: 'shipped',
                updatedBy: req.user.name
            }, { transaction });

            // Increase restaurant wallet by system fees
            const currentWallet = parseFloat(restaurant.wallet) || 0;
            const newWallet = currentWallet + systemFees;
            await restaurant.update({
                wallet: newWallet,
                updatedBy: req.user.name
            }, { transaction });

            await transaction.commit();

            res.status(200).json({
                message: 'Order marked as shipped successfully',
                order: {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    status: order.status,
                    deliveryStatus: order.deliveryStatus,
                    deliveryManId: order.deliveryManId,
                    updatedAt: order.updatedAt
                },
                restaurantWalletIncrease: {
                    amount: systemFees,
                    newBalance: newWallet
                }
            });
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

// Delivery Man: Get my assigned orders where status is completed
const getMyCompletedOrders = async (req, res) => {
    try {
        const { deliveryManId } = req.query;
        if (!req.user.deliverymanId) {
            return res.status(400).json({ message: 'Delivery man not found in user session' });
        }
        if (!deliveryManId || isNaN(parseInt(deliveryManId))) {
            return res.status(400).json({ message: 'Valid delivery man ID is required' });
        }

        // Ensure the requesting delivery man matches the query param
        if (parseInt(deliveryManId) !== req.user.deliverymanId) {
            return res.status(403).json({ message: 'You can only view your own orders' });
        }

        const orders = await Order.findAll({
            where: {
                deliveryManId: parseInt(deliveryManId),
                status: 'completed',
                isActive: true,
                isDeleted: false
            },
            attributes: [
                'id',
                'orderNumber',
                'status',
                'deliveryStatus',
                'totalAmount',
                'createdAt',
                'updatedAt',
                'customerId',
                'restaurantId'
            ],
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['id', 'name', 'phoneNumber']
                },
                {
                    model: Restaurant,
                    as: 'restaurant',
                    attributes: ['id', 'name']
                },
                {
                    model: Address,
                    as: 'address',
                    attributes: ['id', 'street', 'city', 'streetAddress', 'name']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            message: 'Your completed orders retrieved successfully',
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

// Delivery Man: Get my assigned orders where status is shipped
const getMyShippedOrders = async (req, res) => {
    try {
        const { deliveryManId } = req.query;

        if (!deliveryManId || isNaN(parseInt(deliveryManId))) {
            return res.status(400).json({ message: 'Valid delivery man ID is required' });
        } if (!req.user.deliverymanId) {
            return res.status(400).json({ message: 'Delivery man not found in user session' });
        }

        // Ensure the requesting delivery man matches the query param
        if (parseInt(deliveryManId) !== req.user.deliverymanId) {
            return res.status(403).json({ message: 'You can only view your own orders' });
        }

        const orders = await Order.findAll({
            where: {
                deliveryManId: parseInt(deliveryManId),
                status: 'shipped',
                isActive: true,
                isDeleted: false
            },
            attributes: [
                'id',
                'orderNumber',
                'status',
                'deliveryStatus',
                'totalAmount',
                'createdAt',
                'updatedAt',
                'customerId',
                'restaurantId'
            ],
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['id', 'name', 'phoneNumber']
                },
                {
                    model: Restaurant,
                    as: 'restaurant',
                    attributes: ['id', 'name']
                },
                {
                    model: Address,
                    as: 'address',
                    attributes: ['id', 'street', 'city', 'streetAddress', 'name']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            message: 'Your shipped orders retrieved successfully',
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

// Delivery Man: Assign a non-assigned order to me
const assignOrderToMe = async (req, res) => {
    try {
        const { deliveryManId } = req.query;
        const { orderId } = req.body;

        if (!deliveryManId || isNaN(parseInt(deliveryManId))) {
            return res.status(400).json({ message: 'Valid delivery man ID is required' });
        } if (!req.user.deliverymanId) {
            return res.status(400).json({ message: 'Delivery man not found in user session' });
        }

        if (!orderId || isNaN(parseInt(orderId))) {
            return res.status(400).json({ message: 'Valid order ID is required' });
        }

        // Ensure the requesting delivery man matches the query param
        if (parseInt(deliveryManId) !== req.user.deliverymanId) {
            return res.status(403).json({ message: 'Delivery man ID does not match your account' });
        }

        const order = await Order.findOne({
            where: {
                id: parseInt(orderId),
                isActive: true,
                isDeleted: false
            }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.deliveryManId !== null) {
            return res.status(400).json({
                message: 'Order is already assigned to a delivery man'
            });
        }

        await order.update({
            deliveryManId: parseInt(deliveryManId),
            updatedBy: req.user.name
        });

        res.status(200).json({
            message: 'Order assigned to you successfully',
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                deliveryStatus: order.deliveryStatus,
                deliveryManId: order.deliveryManId,
                updatedAt: order.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

const getOrderByFcode = async (req, res) => {
    try {
        const { fcode } = req.params;

        if (!fcode) {
            return res.status(400).json({ message: 'FCODE is required' });
        }

        const order = await Order.findOne({
            where: {
                fcode: fcode,
                isActive: true,
                isDeleted: false
            },
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    where: { isActive: true },
                    required: false
                },
                {
                    model: Cart,
                    as: 'cart',
                    attributes: ['restaurantId']
                }
            ]
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found with this FCODE' });
        }

        // Format the order using the helper function
        const formattedOrders = await formatOrdersForRestaurant([order]);

        res.status(200).json({
            message: 'Order retrieved successfully',
            data: formattedOrders[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

/**
 * Get unpaid orders for customer
 * GET /api/orders/unpaid
 */
const getUnpaidOrders = async (req, res) => {
    try {
        const customerId = req.user.customerId;
        const { page = 1, limit = 10 } = req.query;

        const offset = (page - 1) * limit;

        const { count, rows: orders } = await Order.findAndCountAll({
            where: {
                customerId: customerId,
                status: 'unpaid',
                isActive: true,
                isDeleted: false
            },
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    where: { isActive: true },
                    required: false
                },
                {
                    model: Restaurant,
                    as: 'restaurant',
                    attributes: ['id', 'name']
                },
                {
                    model: Address,
                    as: 'address'
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get unpaid orders error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Cancel an unpaid order
 * POST /api/orders/unpaid/:orderId/cancel
 */
const cancelUnpaidOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const customerId = req.user.customerId;

        const order = await Order.findOne({
            where: {
                id: orderId,
                customerId: customerId,
                status: 'unpaid',
                isActive: true,
                isDeleted: false
            }
        });

        if (!order) {
            return res.status(404).json({ message: 'Unpaid order not found' });
        }

        await order.update({
            status: 'cancelled',
            deliveryStatus: 'cancelled',
            paymentStatus: 'cancelled',
            updatedBy: req.user.name
        });

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status
            }
        });
    } catch (error) {
        console.error('Cancel unpaid order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Retry payment for an unpaid order
 * POST /api/orders/unpaid/:orderId/retry-payment
 */
const retryPayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const customerId = req.user.customerId;

        const order = await Order.findOne({
            where: {
                id: orderId,
                customerId: customerId,
                status: 'unpaid',
                isActive: true,
                isDeleted: false
            },
            include: [
                {
                    model: Address,
                    as: 'address'
                }
            ]
        });

        if (!order) {
            return res.status(404).json({ message: 'Unpaid order not found' });
        }

        const { PayMobOrder } = require('../../models');
        
        // First, check if there's a successful payment for this order
        const successfulPayment = await PayMobOrder.findOne({
            where: {
                orderId: order.id,
                status: 'completed',
                paymentStatus: 'paid'
            }
        });

        if (successfulPayment) {
            return res.status(404).json({ 
                message: 'Order already has a successful payment',
                success: false
            });
        }

        // Check if there's already a pending PayMobOrder for this order
        let existingPayMobOrder = await PayMobOrder.findOne({
            where: {
                orderId: order.id,
                status: 'pending',
                paymentStatus: 'pending'
            },
            order: [['createdAt', 'DESC']]
        });

        let paymobData;

        if (existingPayMobOrder && existingPayMobOrder.paymentKey) {
            // Reuse existing payment link to prevent duplicate payments
            console.log(`Reusing existing payment link for order ${order.id}, PayMobOrder ID: ${existingPayMobOrder.id}`);
            
            paymobData = {
                iframe_url: `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${existingPayMobOrder.paymentKey}`,
                payment_token: existingPayMobOrder.paymentKey,
                paymob_order_id: existingPayMobOrder.paymobOrderId,
                reused: true
            };
        } else {
            // Create new payment link
            console.log(`Creating new payment link for order ${order.id}`);
            
            const customer = await Customer.findByPk(customerId);
            const address = order.address;

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

            // Check if any PayMobOrder exists for this order (to avoid duplicate merchant_order_id)
            const anyExistingPayMobOrder = await PayMobOrder.findOne({
                where: { orderId: order.id }
            });

            // Use unique merchant_order_id if this is a retry (to avoid Paymob duplicate error)
            const merchantOrderId = anyExistingPayMobOrder 
                ? `${order.id}-retry-${Date.now()}`
                : order.id;

            const paymobOrder = await paymobService.registerOrder({
                amount_cents: Math.round(order.totalAmount * 100),
                currency: 'EGP',
                merchant_order_id: merchantOrderId
            });

            const paymentKey = await paymobService.generatePaymentKey({
                amount_cents: Math.round(order.totalAmount * 100),
                currency: 'EGP',
                order_id: paymobOrder.id,
                billing_data: billingData
            });

            // Create PayMobOrder record in database
            await PayMobOrder.create({
                orderId: order.id,
                customerId: customerId,
                paymobOrderId: paymobOrder.id.toString(),
                amount: order.totalAmount,
                amountCents: Math.round(order.totalAmount * 100),
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
                paymob_order_id: paymobOrder.id,
                reused: false
            };
        }

        res.status(200).json({
            success: true,
            message: 'Payment retry initiated successfully',
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount
            },
            payment: paymobData
        });
    } catch (error) {
        console.error('Retry payment error:', error);
        res.status(500).json({ 
            message: 'Failed to initiate payment retry',
            error: error.message 
        });
    }
};

const processFriendPayment = async (req, res) => {
    try {
        const { fcode } = req.params;

        if (!fcode) {
            return res.status(400).json({ message: 'FCODE is required' });
        }

        const order = await Order.findOne({
            where: {
                fcode: fcode,
                paymentMethod: 'friend',
                paymentStatus: 'pending',
                isActive: true,
                isDeleted: false
            },
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    where: { isActive: true },
                    required: false
                },
                {
                    model: Cart,
                    as: 'cart',
                    attributes: ['restaurantId']
                },
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['id', 'name', 'emailAddress', 'phoneNumber']
                },
                {
                    model: Address,
                    as: 'address'
                }
            ]
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found or already paid' });
        }

        // Check if there's already a pending PayMobOrder for this order
        const { PayMobOrder } = require('../../models');
        let existingPayMobOrder = await PayMobOrder.findOne({
            where: {
                orderId: order.id,
                status: 'pending',
                paymentStatus: 'pending'
            },
            order: [['createdAt', 'DESC']]
        });

        let paymobData;

        if (existingPayMobOrder && existingPayMobOrder.paymentKey) {
            // Reuse existing payment link to prevent duplicate payments
            console.log(`Reusing existing payment link for friend payment, order ${order.id}, PayMobOrder ID: ${existingPayMobOrder.id}`);
            
            paymobData = {
                iframe_url: `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${existingPayMobOrder.paymentKey}`,
                payment_token: existingPayMobOrder.paymentKey,
                paymob_order_id: existingPayMobOrder.paymobOrderId,
                reused: true
            };
        } else {
            // Create new payment link only if none exists
            console.log(`Creating new payment link for friend payment, order ${order.id}`);
            
            const customer = order.customer;
            const billingData = {
                email: customer.emailAddress || 'customer@example.com',
                first_name: customer.name ? customer.name.split(' ')[0] : 'Customer',
                last_name: customer.name ? customer.name.split(' ').slice(1).join(' ') : '',
                phone_number: customer.phoneNumber || '01000000000',
                street: order.address?.street || 'N/A',
                building: order.address?.building || 'N/A',
                floor: order.address?.floor || 'N/A',
                apartment: order.address?.apartment || 'N/A',
                city: order.address?.city || 'Cairo',
                country: 'EG',
                postal_code: order.address?.postalCode || '00000'
            };

            const paymobOrder = await paymobService.registerOrder({
                amount_cents: Math.round(order.totalAmount * 100),
                currency: 'EGP',
                merchant_order_id: order.id
            });

            const paymentKey = await paymobService.generatePaymentKey({
                amount_cents: Math.round(order.totalAmount * 100),
                currency: 'EGP',
                order_id: paymobOrder.id,
                billing_data: billingData
            });

            // Create PayMobOrder record in database
            await PayMobOrder.create({
                orderId: order.id,
                customerId: order.customerId,
                paymobOrderId: paymobOrder.id.toString(),
                amount: order.totalAmount,
                amountCents: Math.round(order.totalAmount * 100),
                currency: 'EGP',
                paymentKey: paymentKey,
                billingData: billingData,
                status: 'pending',
                paymentStatus: 'pending',
                createdBy: `friend-payment:${order.customerId}`
            });

            paymobData = {
                iframe_url: `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`,
                payment_token: paymentKey,
                paymob_order_id: paymobOrder.id,
                reused: false
            };
        }

        res.status(200).json({
            success: true,
            message: 'Friend payment initiated successfully',
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount,
                customerName: order.customer?.name
            },
            payment: paymobData
        });
    } catch (error) {
        console.error('Friend payment error:', error);
        res.status(500).json({ 
            message: 'Failed to process friend payment',
            error: error.message 
        });
    }
};

const adminCancelApprovedCashOrder = async (req, res) => {
    try {
        const { orderId, cancellationReason } = req.body;

        if (!orderId) {
            return res.status(400).json({ message: 'Order ID is required' });
        }

        if (!cancellationReason) {
            return res.status(400).json({ message: 'Cancellation reason is required' });
        }

        const order = await Order.findOne({
            where: {
                id: parseInt(orderId),
                isActive: true
            }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if order is cash payment
        if (order.paymentMethod !== 'cash') {
            return res.status(400).json({
                message: `Cannot cancel this order. Only cash payment orders can be cancelled. Current payment method: ${order.paymentMethod}`
            });
        }

        // Check if order status is accepted
        if (order.status === 'shipped' || order.status === 'delivered') {
            return res.status(400).json({
                message: `Cannot cancel order. Order must not be in finished status. Current status: ${order.status}`
            });
        }

        // Update order to cancelled status
        await order.update({
            status: 'cancelled',
            deliveryStatus: 'cancelled',
            notes: cancellationReason,
            updatedBy: req.user.name || 'Admin'
        });

        // Fetch customer to send notification
        const customer = await Customer.findByPk(order.customerId);

        // Send notification if customer has FCM token
        if (customer && customer.fcmToken) {
            try {
                await sendNotificationToToken({
                    token: customer.fcmToken,
                    title: 'تم إلغاء طلبك',
                    body: `تم إلغاء طلبك من ${order.restaurantName}. السبب: ${cancellationReason}`,
                    data: {
                        screen: "customerCancelledTap",
                        orderId: order.id.toString()
                    }
                });
                console.log(`Cancellation notification sent to customer ${customer.id} for order ${order.id}`);
            } catch (notificationError) {
                console.error('Failed to send cancellation notification:', notificationError);
            }
        }

        return res.status(200).json({
            message: 'Order cancelled successfully',
            order: {
                id: order.id,
                status: order.status,
                deliveryStatus: order.deliveryStatus,
                cancellationReason
            }
        });
    } catch (error) {
        console.error('Admin cancel order error:', error);
        return res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
};

module.exports = {
    getPendingOrders,
    getAcceptedOrders,
    getShippedOrders,
    getCompletedOrders,
    getDeniedOrders,
    getAllOrders,
    acceptOrDenyOrder,
    completeOrder,
    shipOrder,
    cancelOrder,
    listCompletedUnassignedOrders,
    listOrdersForDeliveryMan,
    markOrderShipping,
    markOrderShipped,
    getMyCompletedOrders,
    getMyShippedOrders,
    assignOrderToMe,
    getOrderByFcode,
    getUnpaidOrders,
    cancelUnpaidOrder,
    retryPayment,
    processFriendPayment,
    adminCancelApprovedCashOrder
};


