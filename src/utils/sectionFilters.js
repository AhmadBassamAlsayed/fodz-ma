const { Op } = require('sequelize');

const getGoodProductFilter = () => ({
  isActive: true,
  forSale: true,
  isDeleted: false
});

const getGoodCategoryFilter = () => ({
  isActive: true,
  isDeleted: false
});

const getGoodRestaurantFilter = (type = null) => {
  const filter = {
    isActive: true,
    isVerified: true,
    isDeleted: false
  };
  
  if (type) {
    filter.type = type;
  }
  
  return filter;
};

const getPlessingOfferFilter = () => ({
  isActive: true,
  isPleassing: true,
  isDeleted: false,
  endDate: {
    [Op.gt]: new Date()
  }
});

const getGoodProductInclude = (models) => ({
  model: models.Product,
  as: 'products',
  where: getGoodProductFilter(),
  required: true,
  attributes: ['id', 'name', 'salePrice', 'description', 'isActive', 'forSale']
});

const getGoodCategoryInclude = (models) => ({
  model: models.Category,
  as: 'categories',
  where: getGoodCategoryFilter(),
  required: true,
  include: [getGoodProductInclude(models)],
  attributes: ['id', 'name', 'description', 'isActive', 'restaurantId']
});

const getPlessingProductInclude = (models) => ({
  model: models.Product,
  as: 'products',
  where: {
    ...getGoodProductFilter(),
    isDeleted: false
  },
  required: true,
  include: [
    {
      model: models.Offer,
      as: 'offers',
      where: getPlessingOfferFilter(),
      required: true,
      attributes: ['id', 'name', 'type', 'amount', 'percentage', 'plessingPrice', 'startDate', 'endDate', 'isActive', 'isPleassing']
    }
  ],
  attributes: ['id', 'name', 'salePrice', 'description', 'isActive', 'forSale']
});

const getPlessingCategoryInclude = (models) => ({
  model: models.Category,
  as: 'categories',
  where: getGoodCategoryFilter(),
  required: true,
  include: [getPlessingProductInclude(models)],
  attributes: ['id', 'name', 'description', 'isActive', 'restaurantId']
});

module.exports = {
  getGoodProductFilter,
  getGoodCategoryFilter,
  getGoodRestaurantFilter,
  getPlessingOfferFilter,
  getGoodProductInclude,
  getGoodCategoryInclude,
  getPlessingProductInclude,
  getPlessingCategoryInclude
};
