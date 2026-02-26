const jwt = require('jsonwebtoken');
const { Restaurant, Customer, DeliveryMan, Admin } = require('../models');

const extractToken = (authorizationHeader = '') => {
  if (typeof authorizationHeader !== 'string') {
    return null;
  }
  const [scheme, token] = authorizationHeader.split(' ');
  if (!token || scheme.toLowerCase() !== 'bearer') {
    return null;
  }
  return token.trim();
};

const ensureRestaurant = async (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ message: 'Authentication token is missing' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload || payload.role !== 'restaurant') {
      return res.status(403).json({ message: 'Access restricted to restaurant accounts' });
    }

    const restaurant = await Restaurant.findOne({ where: { id: payload.id } });

    if (!restaurant || restaurant.status === 'deleted') {
      return res.status(403).json({ message: 'Restaurant account is not available' });
    }

    req.user = {
      id: restaurant.id,
      restaurantId: restaurant.id,
      role: 'restaurant',
      restaurant
    };

    next();
  } catch (error) {
    const status = error.name === 'TokenExpiredError' ? 401 : 403;
    const message =
      error.name === 'TokenExpiredError'
        ? 'Authentication token has expired'
        : 'Failed to authenticate restaurant account';
    res.status(status).json({ message });
  }
};

const userTogle = async (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);
    
    // If no token, allow request to pass through
    if (!token) {
      return next();
    }

    // If token exists, validate it
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload || !payload.role) {
      return next(); // Invalid token, but still allow request to pass
    }

    // Check based on role and save user data if valid
    if (payload.role === 'restaurant') {
      const restaurant = await Restaurant.findOne({
         where: { id: payload.id } 
        });

      if (restaurant && restaurant.status === 'active' && restaurant.isVerified === true) {
        req.user = {
          id: restaurant.id,
          restaurantId: restaurant.id,
          role: 'restaurant',
          name: restaurant.name,
          restaurant
        };
      }
    } else if (payload.role === 'customer') {
      const { Address } = require('../models');
      const customer = await Customer.findOne({ 
        where: { id: payload.id },
        include: [{
          model: Address,
          as: 'addresses',
          where: { isDefault: true, isActive: true, isDeleted: false },
          required: false,
          attributes: ['id', 'city']
        }]
      });

      if (customer && customer.status === 'active' && customer.isActive === true) {
        req.user = {
          id: customer.id,
          customerId: customer.id,
          role: 'customer',
          name: customer.name,
          customer,
          defaultAddress: customer.addresses && customer.addresses.length > 0 ? customer.addresses[0] : null
        };
      }
    } else if (payload.role === 'deliveryman') {
      const deliveryman = await Deliveryman.findOne({ where: { id: payload.id } });

      if (deliveryman && deliveryman.status === 'active' && deliveryman.isActive === true) {
        req.user = {
          id: deliveryman.id,
          deliverymanId: deliveryman.id,
          role: 'deliveryman',
          name: deliveryman.name,
          deliveryman
        };
      }
    }

    next();
  } catch (error) {
    // Even if token validation fails, allow request to pass through
    next();
  }
};

const ensureActive= async (req,res,next)=>{
  try {
    const token = extractToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ message: 'Authentication token is missing' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload || !payload.role) {
      return res.status(403).json({ message: 'Invalid authentication token' });
    }

    // Check based on role
    if (payload.role === 'restaurant') {
      const restaurant = await Restaurant.findOne({ where: { id: payload.id } });

      if (!restaurant || restaurant.status !== 'active' || restaurant.isVerified !== true) {
        return res.status(403).json({ message: 'Restaurant account is not active or verified' });
      }

      req.user = {
        id: restaurant.id,
        restaurantId: restaurant.id,
        role: 'restaurant',
        name: restaurant.name,
        restaurant
      };
    } else if (payload.role === 'customer') {
      const customer = await Customer.findOne({ where: { id: payload.id } });

      if (!customer || customer.status !== 'active' || customer.isActive !== true) {
        return res.status(403).json({ message: 'Customer account is not active' });
      }

      req.user = {
        id: customer.id,
        customerId: customer.id,
        role: 'customer',
        name: customer.name,
        customer
      };
    } else if (payload.role === 'deliveryman') {
      const deliveryMan = await DeliveryMan.findOne({ where: { id: payload.id } });

      if (!deliveryMan || deliveryMan.status !== 'active' || deliveryMan.isActive !== true || deliveryMan.isVerified !== true) {
        return res.status(403).json({ message: 'Deliveryman account is not active or verified' });
      }

      req.user = {
        id: deliveryMan.id,
        deliverymanId: deliveryMan.id,
        role: 'deliveryman',
        name: deliveryMan.name,
        deliveryMan
      };
    } else {
      return res.status(403).json({ message: 'Invalid account role' });
    }

    next();
  } catch (error) {
    
    const status = error.name === 'TokenExpiredError' ? 401 : 403;
    const message =
      error.name === 'TokenExpiredError'
        ? 'Authentication token has expired'
        : 'Failed to authenticate account';
    res.status(status).json({ message });
  }
};


const ensureDelivery = async (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ message: 'Authentication token is missing' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload || payload.role !== 'deliveryman') {
      return res.status(403).json({ message: 'Access restricted to delivery man accounts' });
    }

    const deliveryMan = await DeliveryMan.findOne({ where: { id: payload.id } });

    if (!deliveryMan) {
      return res.status(403).json({ message: 'Delivery man account not found' });
    }

    if (deliveryMan.status !== 'active') {
      return res.status(403).json({ message: 'Delivery man account status is not active' });
    }

    if (!deliveryMan.isActive) {
      return res.status(403).json({ message: 'Delivery man account is deactivated' });
    }

    req.user = {
      id: deliveryMan.id,
      deliverymanId: deliveryMan.id,
      role: 'deliveryman',
      name: deliveryMan.name,
      deliveryMan
    };

    next();
  } catch (error) {
    console.log('ensureDelivery error:', error.message);
    console.log(error);
    const status = error.name === 'TokenExpiredError' ? 401 : 403;
    const message =
      error.name === 'TokenExpiredError'
        ? 'Authentication token has expired'
        : 'Failed to authenticate delivery man account';
    res.status(status).json({ message });
  }
};

const ensureAdmine = async (req,res,next)=>{
  try {
    const token = extractToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ message: 'Authentication token is missing' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload || payload.role !== 'admin') {
      return res.status(403).json({ message: 'Access restricted to admin accounts' });
    }

    const admin = await Admin.findOne({ where: { id: payload.id } });

    if (!admin || admin.status === 'deleted') {
      return res.status(403).json({ message: 'Admin account is not available' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ message: 'Admin account is not active' });
    }

    req.user = {
      id: admin.id,
      adminId: admin.id,
      role: 'admin',
      name: admin.name,
      admin
    };

    next();
  } catch (error) {
    const status = error.name === 'TokenExpiredError' ? 401 : 403;
    const message =
      error.name === 'TokenExpiredError'
        ? 'Authentication token has expired'
        : 'Failed to authenticate admin account';
    res.status(status).json({ message });
  }
}

module.exports = {
  ensureRestaurant,
  ensureActive,
  ensureAdmine,
  ensureDelivery,
  userTogle
};
