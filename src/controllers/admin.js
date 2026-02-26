const { Restaurant, Order, Customer, Rate, DeliveryMan, Address, Warning, sequelize } = require('../../models');
const { Op } = require('sequelize');
const { sendNotificationToToken } = require('../utils/firebase');

const listRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      attributes: [
        'id',
        'name',
        'phoneNumber',
        'emailAddress',
        'photoUrl',
        'coverUrl',
        'pdfUrl',
        'status',
        'isActive',
        'isVerified',
        'type',
        'city',
        'country',
        'createdAt',
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM rates
            WHERE rates."restaurantId" = "Restaurant"."id" AND rates.status = 'active'
          )`),
          'totalRates'
        ],
        [
          sequelize.literal(`(
            SELECT COALESCE(AVG(rating), 0)
            FROM rates
            WHERE rates."restaurantId" = "Restaurant"."id" AND rates.status = 'active' AND rating IS NOT NULL
          )`),
          'averageRating'
        ]
      ],
      order: [['createdAt', 'DESC']],
      where:{isVerified:true}
    
    });

    res.status(200).json({
      message: 'Restaurants retrieved successfully',
      restaurants: restaurants
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
    console.log(error);
  }
};

const listOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      attributes: [
        'id',
        'orderNumber',
        'status',
        'paymentStatus',
        'paymentMethod',
        'totalAmount',
        'deliveryStatus',
        'createdAt'
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
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      message: 'Orders retrieved successfully',
      orders
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
    console.log(error);
  }
};



const listBannedUsers = async (req, res) => {
  try {
    const bannedUsers = await Customer.findAll({
      where: {
        status: 'banned'
      },
      attributes: ['id', 'name', 'phoneNumber', 'banReason', 'updatedAt'],
      order: [['updatedAt', 'DESC']]
    });

    res.status(200).json({
      message: 'Banned users retrieved successfully',
      bannedUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
    console.log(error);
  }
};

const banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { banReason } = req.body;

    if (!banReason || banReason.trim() === '') {
      return res.status(400).json({ message: 'Ban reason is required' });
    }

    const customer = await Customer.findOne({
      where: { id: userId }
    });

    if (!customer) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (customer.status === 'banned') {
      return res.status(400).json({ message: 'User is already banned' });
    }

    await customer.update({
      status: 'banned',
      banReason: banReason.trim(),
      updatedBy: req.user.name || `Admin-${req.user.id}`,
      isActive:false
    });

    res.status(200).json({
      message: 'User banned successfully',
      user: {
        id: customer.id,
        name: customer.name,
        phoneNumber: customer.phoneNumber,
        status: customer.status,
        banReason: customer.banReason
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
    console.log(error);
  }
};

const unBanUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const customer = await Customer.findOne({
      where: { id: userId }
    });

    if (!customer) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (customer.status != 'banned') {
      return res.status(400).json({ message: 'User is not banned' });
    }

    await customer.update({
      status: 'active',
      banReason: null,
      updatedBy: req.user.name || `Admin-${req.user.id}`,
      isActive:false
    });

    res.status(200).json({
      message: 'User unbanned successfully',
      user: {
        id: customer.id,
        name: customer.name,
        phoneNumber: customer.phoneNumber,
        status: customer.status,
        banReason: customer.banReason
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
    console.log(error);
  }
};


const listPendingDeliveryMen = async (req, res) => {
  try {
    const pendingDeliveryMen = await DeliveryMan.findAll({
      where: {
        isActive: true,
        isVerified:false,
        isDeleted: false
      },
      attributes: [
        'id',
        'name',
        'phoneNumber',
        'emailAddress',
        'pdfPath',
        'pdf1Url',
        'pdf2Url',
        'pdf3Url',
        'status',
        'createdAt'
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      message: 'Pending delivery men retrieved successfully',
      deliveryMen: pendingDeliveryMen
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
    console.log(error);
  }
};

const approveDeliveryMan = async (req, res) => {
  try {
    const { deliveryManId } = req.params;

    const deliveryMan = await DeliveryMan.findOne({
      where: { id: deliveryManId }
    });

    if (!deliveryMan) {
      return res.status(404).json({ message: 'Delivery man not found' });
    }

    if (deliveryMan.isVerified) {
      return res.status(400).json({ message: 'Delivery man is already approved' });
    }

    await deliveryMan.update({
      isActive: true,
      isVerified:true,
      status: 'active',
      updatedBy: req.user.name || `Admin-${req.user.id}`
    });

    res.status(200).json({
      message: 'Delivery man approved successfully',
      deliveryMan: {
        id: deliveryMan.id,
        name: deliveryMan.name,
        phoneNumber: deliveryMan.phoneNumber,
        emailAddress: deliveryMan.emailAddress,
        isActive: deliveryMan.isActive,
        status: deliveryMan.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
    console.log(error);
  }
};


const getDrivers = async (req, res) => {
  try {
    const {
      search,
      status,
      isActive,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const allowedSortColumns = ['createdAt', 'name'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder && sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const offset = (pageNumber - 1) * pageSize;

    const whereClause = { isDeleted: false,isVerified:true };

    if (typeof isActive !== 'undefined') {
      if (['true', 'false'].includes(String(isActive))) {
        whereClause.isActive = String(isActive) === 'true';
      }
    }

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      const likeQuery = { [Op.iLike]: `%${search.trim()}%` };
      whereClause[Op.or] = [
        { name: likeQuery },
        { phoneNumber: likeQuery },
        { emailAddress: likeQuery }
      ];
    }

    const { rows: drivers, count } = await DeliveryMan.findAndCountAll({
      where: whereClause,
      attributes: [
        'id',
        'name',
        'phoneNumber',
        'emailAddress',
        'pdfPath',
        'pdf1Url',
        'pdf2Url',
        'pdf3Url',
        'isActive',
        'status',
        'createdAt'
      ],
      order: [[safeSortBy, safeSortOrder]],
      limit: pageSize,
      offset
    });

    res.status(200).json({
      message: 'Drivers retrieved successfully',
      drivers,
      meta: {
        total: count,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(count / pageSize) || 1
      }
    });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const listAllUsers = async (req, res) => {
    try {
        const users = await Customer.findAll({
            attributes: [
                'id',
                'name',
                'phoneNumber',
                'emailAddress',
                'emailVerified',
                'isActive',
                'status',
                'lastLogin',
                'banReason',
                'createdAt',
                'updatedAt'
            ],
            include: [
                {
                    model: Address,
                    as: 'addresses',
                    attributes: ['city'],
                    where: {
                        isDefault: true,
                        isActive: true,
                        isDeleted: false
                    },
                    required: false
                }
            ],
            where: {
                isDeleted: false,
                status: { [Op.ne]: 'banned' },
            },
            order: [['createdAt', 'DESC']]
        });

        const usersWithCity = users.map(user => {
            const userData = user.toJSON();
            return {
                ...userData,
                city: userData.addresses && userData.addresses.length > 0 ? userData.addresses[0].city : null,
                addresses: undefined
            };
        });

        res.status(200).json({
            message: 'Users retrieved successfully',
            users: usersWithCity
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
        console.log(error.message);
        console.log(error);
    }
}

const acceptRestaurant = async (req, res) => {
    try {
        const resId = Number(req.params.resId);
        if (!Number.isInteger(resId)) {
            return res.status(400).json({ message: 'Invalid restaurant identifier' });
        }

        const restaurant = await Restaurant.findOne({ where: { id: resId } });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        await restaurant.update({
            status: 'active',
            isVerified: true,
            isActive: true
        });

        return res.status(200).json({
            message: 'Restaurant accepted and activated successfully',
            data: {
                id: restaurant.id,
                name: restaurant.name,
                status: restaurant.status,
                isVerified: restaurant.isVerified,
                isActive: restaurant.isActive
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
        console.log(error.message);
        console.log(error);
    }
}

const listActRes = async (req, res) => {
    try {
        const restaurants = await Restaurant.findAll({
            where: {
                status: 'active',
                isActive: true,
                isVerified: true
            },
            attributes: ['id', 'name', 'photoUrl', 'coverUrl', 'type', 'description'],
            order: [['name', 'ASC']]
        });

        return res.status(200).json({
            message: 'Active restaurants fetched successfully',
            data: restaurants
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const listPendingRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.findAll({
            where: {
                isVerified: false,
                isActive: true,
                isDeleted: false
            },
            attributes: [
                'id',
                'name',
                'phoneNumber',
                'emailAddress',
                'pdfUrl',
                'status',
                'isActive',
                'isVerified',
                'type',
                'city',
                'country',
                'photoUrl',
                'coverUrl',
                'createdAt'
            ],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            message: 'Pending restaurants retrieved successfully',
            restaurants
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const listBannedRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.findAll({
            where: {
                isActive: false,
                isDeleted: false
            },
            attributes: [
                'id',
                'name',
                'phoneNumber',
                'emailAddress',
                'status',
                'isActive',
                'isVerified',
                'type',
                'city',
                'country',
                'photoUrl',
                'coverUrl',
                'updatedAt'
            ],
            order: [['updatedAt', 'DESC']]
        });

        return res.status(200).json({
            message: 'Banned restaurants retrieved successfully',
            restaurants
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const banRestaurant = async (req, res) => {
    try {
        const { resId } = req.params;

        const restaurant = await Restaurant.findOne({
            where: { id: resId, isDeleted: false }
        });

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        if (!restaurant.isActive) {
            return res.status(400).json({ message: 'Restaurant is already banned' });
        }

        await restaurant.update({
            isActive: false,
            updatedBy: req.user.name || `Admin-${req.user.id}`
        });

        return res.status(200).json({
            message: 'Restaurant banned successfully',
            restaurant: {
                id: restaurant.id,
                name: restaurant.name,
                isActive: restaurant.isActive,
                status: restaurant.status
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const unbanRestaurant = async (req, res) => {
    try {
        const { resId } = req.params;

        const restaurant = await Restaurant.findOne({
            where: { id: resId, isDeleted: false }
        });

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        if (restaurant.isActive) {
            return res.status(400).json({ message: 'Restaurant is not banned' });
        }

        await restaurant.update({
            isActive: true,
            updatedBy: req.user.name || `Admin-${req.user.id}`
        });

        return res.status(200).json({
            message: 'Restaurant unbanned successfully',
            restaurant: {
                id: restaurant.id,
                name: restaurant.name,
                isActive: restaurant.isActive,
                status: restaurant.status
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Verify a delivery man (set isVerified to true)
 */
const verifyDeliveryMan = async (req, res) => {
  try {
    const { deliveryManId } = req.params;

    const deliveryMan = await DeliveryMan.findByPk(deliveryManId);

    if (!deliveryMan) {
      return res.status(404).json({ message: 'Delivery man not found' });
    }

    if (deliveryMan.isVerified) {
      return res.status(400).json({ message: 'Delivery man is already verified' });
    }

    await deliveryMan.update({
      isVerified: true,
      updatedBy: `admin:${req.user.id}`
    });

    res.status(200).json({
      message: 'Delivery man verified successfully',
      deliveryMan: {
        id: deliveryMan.id,
        name: deliveryMan.name,
        phoneNumber: deliveryMan.phoneNumber,
        isActive: deliveryMan.isActive,
        isVerified: deliveryMan.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
    console.log(error);
  }
};

/**
 * Ban a delivery man (set isActive to false)
 */
const banDeliveryMan = async (req, res) => {
  try {
    const { deliveryManId } = req.params;

    const deliveryMan = await DeliveryMan.findByPk(deliveryManId);

    if (!deliveryMan) {
      return res.status(404).json({ message: 'Delivery man not found' });
    }

    if (!deliveryMan.isActive) {
      return res.status(400).json({ message: 'Delivery man is already banned' });
    }

    await deliveryMan.update({
      isActive: false,
      updatedBy: `admin:${req.user.id}`
    });

    res.status(200).json({
      message: 'Delivery man banned successfully',
      deliveryMan: {
        id: deliveryMan.id,
        name: deliveryMan.name,
        phoneNumber: deliveryMan.phoneNumber,
        isActive: deliveryMan.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
    console.log(error);
  }
};

/**
 * Unban a delivery man (set isActive to true)
 */
const unbanDeliveryMan = async (req, res) => {
  try {
    const { deliveryManId } = req.params;

    const deliveryMan = await DeliveryMan.findByPk(deliveryManId);

    if (!deliveryMan) {
      return res.status(404).json({ message: 'Delivery man not found' });
    }

    if (deliveryMan.isActive) {
      return res.status(400).json({ message: 'Delivery man is not banned' });
    }

    await deliveryMan.update({
      isActive: true,
      updatedBy: `admin:${req.user.id}`
    });

    res.status(200).json({
      message: 'Delivery man unbanned successfully',
      deliveryMan: {
        id: deliveryMan.id,
        name: deliveryMan.name,
        phoneNumber: deliveryMan.phoneNumber,
        isActive: deliveryMan.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
    console.log(error);
  }
};

/**
 * List all banned delivery men (isActive = false)
 */
const listBannedDeliveryMen = async (req, res) => {
  try {
    const deliveryMen = await DeliveryMan.findAll({
      where: {
        isActive: false,
        isDeleted: false
      },
      attributes: [
        'id',
        'name',
        'phoneNumber',
        'emailAddress',
        'isActive',
        'isVerified',
        'rate',
        'deliveredOrders',
        'createdAt'
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      message: 'Banned delivery men retrieved successfully',
      deliveryMen: deliveryMen
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
    console.log(error);
  }
};

const deleteRestaurant = async (req, res) => {
  try {
    const { resId } = req.params;

    const restaurant = await Restaurant.findOne({
      where: { id: resId }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    await restaurant.destroy();

    return res.status(200).json({
      message: 'Restaurant deleted successfully'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createWarning = async (req, res) => {
  try {
    const { deliveryManId, title, body } = req.body;

    if (!deliveryManId || !title || !body) {
      return res.status(400).json({ 
        message: 'deliveryManId, title, and body are required' 
      });
    }

    // Verify delivery man exists
    const deliveryMan = await DeliveryMan.findOne({
      where: {
        id: deliveryManId,
        isDeleted: false
      }
    });

    if (!deliveryMan) {
      return res.status(404).json({ message: 'Delivery man not found' });
    }

    // Create warning
    const warning = await Warning.create({
      deliveryManId,
      title,
      body,
      createdBy: req.user.name || 'Admin',
      updatedBy: req.user.name || 'Admin'
    });

    // Send notification to delivery man
    if (deliveryMan.fcmToken) {
      try {
        await sendNotificationToToken(deliveryMan.fcmToken, title, body);
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError);
      }
    }

    return res.status(201).json({
      message: 'Warning created and notification sent successfully',
      warning: {
        id: warning.id,
        deliveryManId: warning.deliveryManId,
        title: warning.title,
        body: warning.body,
        createdAt: warning.createdAt
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  listRestaurants,
  listOrders,
  listBannedUsers,
  banUser,
  listPendingDeliveryMen,
  approveDeliveryMan,
  getDrivers,
  listAllUsers,
  unBanUser,
  acceptRestaurant,
  listActRes,
  listPendingRestaurants,
  listBannedRestaurants,
  banRestaurant,
  unbanRestaurant,
  verifyDeliveryMan,
  banDeliveryMan,
  unbanDeliveryMan,
  listBannedDeliveryMen,
  deleteRestaurant,
  createWarning
};
