const { Rate, Product, Restaurant } = require('../../models');

const getRate = async (req, res) => {
  try {
    const { customerId, resId, productId } = req.query;

    if (!customerId) {
      return res.status(400).json({ message: 'customerId is required' });
    }

    if (!resId && !productId) {
      return res.status(400).json({ message: 'Either resId or productId is required' });
    }

    let whereClause = {
      customerId: Number(customerId),
      status: 'active',
      isActive: true
    };

    if (productId) {
      whereClause.productId = Number(productId);
    } else if (resId) {
      whereClause.restaurantId = Number(resId);
      whereClause.productId = null;
    }

    const rate = await Rate.findOne({
      where: whereClause,
      attributes: ['rating']
    });

    if (!rate) {
      return res.status(200).json({
        rate: 0
      });
    }

    return res.status(200).json({
      rate: rate.rating
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const createOrUpdateRate = async (req, res) => {
  try {
    const { customerId, restaurantId, productId, rating } = req.body;

    if (!customerId) {
      return res.status(400).json({ message: 'customerId is required' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'rating must be between 1 and 5' });
    }

    if (!restaurantId && !productId) {
      return res.status(400).json({ message: 'Either restaurantId or productId is required' });
    }

    if (restaurantId && productId) {
      return res.status(400).json({ message: 'Cannot rate both restaurant and product at the same time' });
    }

    if (productId) {
      const product = await Product.findOne({
        where: {
          id: productId,
          status: 'active',
          isActive: true,
          isDeleted: false
        }
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const existingRate = await Rate.findOne({
        where: {
          customerId,
          productId,
          status: 'active',
          isActive: true
        }
      });

      if (existingRate) {
        existingRate.rating = rating;
        existingRate.updatedBy = customerId.toString();
        await existingRate.save();

        return res.status(200).json({
          message: 'Product rating updated successfully',
          data: {
            id: existingRate.id,
            rating: existingRate.rating
          }
        });
      } else {
        const newRate = await Rate.create({
          customerId,
          productId,
          rating,
          restaurantId: null,
          orderId: null,
          deliveryManId: null,
          totalAmount: 0,
          status: 'active',
          isActive: true,
          createdBy: customerId.toString()
        });

        return res.status(201).json({
          message: 'Product rating created successfully',
          data: {
            id: newRate.id,
            rating: newRate.rating
          }
        });
      }

    } else if (restaurantId) {
      const restaurant = await Restaurant.findOne({
        where: {
          id: restaurantId,
          status: 'active',
          isActive: true
        }
      });

      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }

      const existingRate = await Rate.findOne({
        where: {
          customerId,
          restaurantId,
          productId: null,
          status: 'active',
          isActive: true
        }
      });

      if (existingRate) {
        existingRate.rating = rating;
        existingRate.updatedBy = customerId.toString();
        await existingRate.save();

        return res.status(200).json({
          message: 'Restaurant rating updated successfully',
          data: {
            id: existingRate.id,
            rating: existingRate.rating
          }
        });
      } else {
        const newRate = await Rate.create({
          customerId,
          restaurantId,
          productId: null,
          rating,
          orderId: null,
          deliveryManId: null,
          totalAmount: 0,
          status: 'active',
          isActive: true,
          createdBy: customerId.toString()
        });

        return res.status(201).json({
          message: 'Restaurant rating created successfully',
          data: {
            id: newRate.id,
            rating: newRate.rating
          }
        });
      }
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getRate,
  createOrUpdateRate
};
