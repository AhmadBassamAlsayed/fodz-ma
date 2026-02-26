const { Restaurant, Category, Product, Offer, sequelize } = require('../../models');
const { Op } = require('sequelize');
const {
  getGoodRestaurantFilter,
  getGoodCategoryFilter,
  getGoodProductFilter,
  getPlessingOfferFilter,
  getGoodProductInclude,
  getGoodCategoryInclude,
  getPlessingProductInclude,
  getPlessingCategoryInclude
} = require('../utils/sectionFilters');

const getResSectionRestaurants = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: restaurants } = await Restaurant.findAndCountAll({
      where: getGoodRestaurantFilter('restaurant'),
      attributes: ['id', 'name', 'phoneNumber', 'emailAddress', 'type', 'city', 'country', 'latitude', 'longitude', 'isActive', 'isVerified', 'createdAt'],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      message: 'Restaurant section restaurants retrieved successfully',
      restaurants,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.log(error.message);
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getResSectionCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: categories } = await Category.findAndCountAll({
      where: getGoodCategoryFilter(),
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          where: getGoodRestaurantFilter('restaurant'),
          required: true,
          attributes: ['id', 'name', 'type', 'isActive', 'isVerified']
        },
        getGoodProductInclude({ Product })
      ],
      attributes: ['id', 'name', 'description', 'isActive', 'restaurantId', 'createdAt'],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      message: 'Restaurant section categories retrieved successfully',
      categories,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.log(error.message);
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getResSectionProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: products } = await Product.findAndCountAll({
      where: getGoodProductFilter(),
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          where: getGoodRestaurantFilter('restaurant'),
          required: true,
          attributes: ['id', 'name', 'type', 'isActive', 'isVerified']
        },
        {
          model: Category,
          as: 'category',
          where: getGoodCategoryFilter(),
          required: true,
          attributes: ['id', 'name', 'isActive']
        }
      ],
      attributes: ['id', 'name', 'salePrice', 'description', 'isActive', 'forSale', 'restaurantId', 'categoryId', 'createdAt'],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      message: 'Restaurant section products retrieved successfully',
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.log(error.message);
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getFamSectionRestaurants = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: restaurants } = await Restaurant.findAndCountAll({
      where: getGoodRestaurantFilter('home'),
      attributes: ['id', 'name', 'phoneNumber', 'emailAddress', 'type', 'city', 'country', 'latitude', 'longitude', 'isActive', 'isVerified', 'createdAt'],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      message: 'Family section restaurants retrieved successfully',
      restaurants,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.log(error.message);
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getFamSectionCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: categories } = await Category.findAndCountAll({
      where: getGoodCategoryFilter(),
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          where: getGoodRestaurantFilter('home'),
          required: true,
          attributes: ['id', 'name', 'type', 'isActive', 'isVerified']
        },
        getGoodProductInclude({ Product })
      ],
      attributes: ['id', 'name', 'description', 'isActive', 'restaurantId', 'createdAt'],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      message: 'Family section categories retrieved successfully',
      categories,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.log(error.message);
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getFamSectionProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: products } = await Product.findAndCountAll({
      where: getGoodProductFilter(),
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          where: getGoodRestaurantFilter('home'),
          required: true,
          attributes: ['id', 'name', 'type', 'isActive', 'isVerified']
        },
        {
          model: Category,
          as: 'category',
          where: getGoodCategoryFilter(),
          required: true,
          attributes: ['id', 'name', 'isActive']
        }
      ],
      attributes: ['id', 'name', 'salePrice', 'description', 'isActive', 'forSale', 'restaurantId', 'categoryId', 'createdAt'],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      message: 'Family section products retrieved successfully',
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.log(error.message);
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getPlessSectionRestaurants = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const restaurantFilter = getGoodRestaurantFilter();
    restaurantFilter.type = { [Op.in]: ['home', 'restaurant'] };

    const { count, rows: restaurants } = await Restaurant.findAndCountAll({
      where: restaurantFilter,
      include: [
        getPlessingCategoryInclude({ Category, Product, Offer })
      ],
      attributes: ['id', 'name', 'phoneNumber', 'emailAddress', 'type', 'city', 'country', 'latitude', 'longitude', 'isActive', 'isVerified', 'createdAt'],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      message: 'Plessing section restaurants retrieved successfully',
      restaurants,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.log(error.message);
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getPlessSectionCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const restaurantFilter = getGoodRestaurantFilter();
    restaurantFilter.type = { [Op.in]: ['home', 'restaurant'] };

    const { count, rows: categories } = await Category.findAndCountAll({
      where: getGoodCategoryFilter(),
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          where: restaurantFilter,
          required: true,
          attributes: ['id', 'name', 'type', 'isActive', 'isVerified']
        },
        getPlessingProductInclude({ Product, Offer })
      ],
      attributes: ['id', 'name', 'description', 'isActive', 'restaurantId', 'createdAt'],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      message: 'Plessing section categories retrieved successfully',
      categories,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.log(error.message);
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getPlessSectionProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const restaurantFilter = getGoodRestaurantFilter();
    restaurantFilter.type = { [Op.in]: ['home', 'restaurant'] };

    const { count, rows: products } = await Product.findAndCountAll({
      where: getGoodProductFilter(),
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          where: restaurantFilter,
          required: true,
          attributes: ['id', 'name', 'type', 'isActive', 'isVerified']
        },
        {
          model: Category,
          as: 'category',
          where: getGoodCategoryFilter(),
          required: true,
          attributes: ['id', 'name', 'isActive']
        },
        {
          model: Offer,
          as: 'offers',
          where: getPlessingOfferFilter(),
          required: true,
          attributes: ['id', 'name', 'type', 'amount', 'percentage', 'plessingPrice', 'startDate', 'endDate', 'isActive', 'isPleassing']
        }
      ],
      attributes: ['id', 'name', 'salePrice', 'description', 'isActive', 'forSale', 'restaurantId', 'categoryId', 'createdAt'],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      message: 'Plessing section products retrieved successfully',
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.log(error.message);
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getResSectionRestaurants,
  getResSectionCategories,
  getResSectionProducts,
  getFamSectionRestaurants,
  getFamSectionCategories,
  getFamSectionProducts,
  getPlessSectionRestaurants,
  getPlessSectionCategories,
  getPlessSectionProducts
};
