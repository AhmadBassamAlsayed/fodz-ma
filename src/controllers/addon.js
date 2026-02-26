const { Addon, AddonPerProduct, Product } = require('../../models');
const { Op } = require('sequelize');

const resolveRestaurantId = (req) => {
  const { restaurantId } = req.body;
  return restaurantId;
};
// checked
const createAddon = async (req, res) => {
  try {
    const restaurantId = resolveRestaurantId(req);
    if (restaurantId !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const {
      name,
      salePrice,
    } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Addon name is required' });
    }
    if (name.length > 160) {
      return res.status(400).json({ message: 'Addon name must be less than 160 characters' });
    }
    const salePriceValue = Number(salePrice);
    
    if (Number.isNaN(salePriceValue) || salePriceValue < 0) {
      return res.status(400).json({ message: 'Sale price must be a non-negative number' });
    }
    

    const addon = await Addon.create({
      name,
      salePrice: salePriceValue,
      restaurantId,
      createdBy: req.user.name,
      updatedBy: req.user.name
    });

    return res.status(201).json({
      message: 'Addon created successfully',
      addon
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
// checked
const updateAddon = async (req, res) => {
    try {
        const restaurantId = resolveRestaurantId(req);
        
        if (restaurantId !== req.user.id) {
          return res.status(401).json({ message: 'Unauthorized' });
        }
    
        const {
          name,
          salePrice,
        } = req.body;
    
        if (!name || !name.trim()) {
          return res.status(400).json({ message: 'Addon name is required' });
        }
    
        if (name.length > 160) {
          return res.status(400).json({ message: 'Addon name must be less than 160 characters' });
        }
    
        const salePriceValue = Number(salePrice);
        
        if (Number.isNaN(salePriceValue) || salePriceValue < 0) {
          return res.status(400).json({ message: 'Sale price must be a non-negative number' });
        }
        
        const addonId = Number(req.params.addon_id);
        if(!Number.isInteger(addonId)){
          return res.status(400).json({ message: 'Invalid addon identifier' });
        }
        const addon = await Addon.findOne({
          where:{ id: addonId, restaurantId }
        });
        if(!addon){
          return res.status(404).json({ message: 'Addon not found' });
        }
        addon.update({
          name,
          salePrice: salePriceValue,
          updatedBy: req.user.name
        });
        return res.status(201).json({
          message: 'Addon updated successfully',
          addon
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
    
};
// checked
const deleteAddon = async (req, res) => {
  try {
    const restaurantId = resolveRestaurantId(req);
    
    if (restaurantId !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const addonId = Number(req.params.addon_id);
    if (!Number.isInteger(addonId)) {
      return res.status(400).json({ message: 'Invalid addon identifier' });
    }

    const addon = await Addon.findOne({ where: { id: addonId, restaurantId } });
    
    if (!addon) {
      return res.status(404).json({ message: 'Addon not found' });
    }

    await addon.update({
      isDeleted: true,
      isActive: false,
      updatedBy: req.user.name
    });
    await AddonPerProduct.update({
      isDeleted: true,
      isActive: false,
      updatedBy: req.user.name
    },{
      where:{addonId}
    })

    return res.status(200).json({
      message: 'Addon deleted successfully'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
// checked and updated
const attachAddon = async (req, res) => {
  try {
    const restaurantId = resolveRestaurantId(req);
    
    if (restaurantId !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const productId = Number(req.params.product_id);
    const addonId = Number(req.params.addon_id);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({ message: 'Invalid product identifier' });
    }

    if (!Number.isInteger(addonId)) {
      return res.status(400).json({ message: 'Invalid addon identifier' });
    }

    // Verify product belongs to restaurant
    const product = await Product.findOne({ 
      where: { id: productId, restaurantId, isDeleted: false} 
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify addon belongs to restaurant
    const addon = await Addon.findOne({ 
      where: { id: addonId, restaurantId,isActive:true } 
    });
    
    if (!addon) {
      return res.status(404).json({ message: 'Addon not found' });
    }

    // Check if already attached
    const existing = await AddonPerProduct.findOne({
      where: { productId: productId, addonId: addonId }
    });

    if (existing) {
      return res.status(400).json({ message: 'Addon already attached to this product' });
    }

    await AddonPerProduct.create({
      productId: productId,
      addonId: addonId,
      status: 'active',
      createdBy: req.user.name,
      updatedBy: req.user.name
    });

    return res.status(201).json({
      message: 'Addon attached to product successfully'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
// checked and updated
const detachAddon = async (req, res) => {
  try {
    const restaurantId = resolveRestaurantId(req);
    
    if (restaurantId !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { productId, addonId } = req.body;

    if (!Number.isInteger(productId)) {
      return res.status(400).json({ message: 'Invalid product identifier' });
    }

    if (!Number.isInteger(addonId)) {
      return res.status(400).json({ message: 'Invalid addon identifier' });
    }

    // Verify product belongs to restaurant
    const product = await Product.findOne({ 
      where: { id: productId, restaurantId } 
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify addon belongs to restaurant
    const addon = await Addon.findOne({ 
      where: { id: addonId, restaurantId } 
    });
    
    if (!addon) {
      return res.status(404).json({ message: 'Addon not found' });
    }

    // Find the attachment
    const addonPerProduct = await AddonPerProduct.update({
      isDeleted: true,
      isActive: false,
      updatedBy: req.user.name
    },{
      where: { productId, addonId }
    });
    if (!addonPerProduct) {
      return res.status(404).json({ message: 'Addon not attached to this product' });
    }
    return res.status(200).json({
      message: 'Addon detached from product successfully'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
// checked
const listMine = async (req, res) => {
  try {
    const restaurantId = Number(req.params.res_id);
    
    if (restaurantId !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!Number.isInteger(restaurantId)) {
      return res.status(400).json({ message: 'Invalid restaurant identifier' });
    }

    const addons = await Addon.findAll({
      where: {
        restaurantId,
        status:'active',
        isActive:true
      },include:[{
        model:AddonPerProduct,
        required:false,
        as:'addonProducts',
        where:{
          status:'active',
          isActive:true
        }
      }]
    });

    // Add isUsed flag to each addon
    const addonsWithUsedFlag = addons.map(addon => {
      const addonData = addon.toJSON();
      addonData.isUsed = addonData.addonProducts && addonData.addonProducts.length > 0;
      delete addonData.addonProducts;
      return addonData;
    });

    return res.status(200).json({
      message: 'Addons fetched successfully',
      addons: addonsWithUsedFlag
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
// checked and updated
const list = async (req, res) => {
  try {
    let { res_id, cat_id, product_id } = req.params;
    res_id = Number(res_id);
    cat_id = Number(cat_id);
    product_id = Number(product_id);

    if (!Number.isInteger(res_id)) {
      return res.status(400).json({ message: 'Invalid restaurant identifier' });
    }

    if (!Number.isInteger(cat_id)) {
      return res.status(400).json({ message: 'Invalid category identifier' });
    }

    if (!Number.isInteger(product_id)) {
      return res.status(400).json({ message: 'Invalid product identifier' });
    }

    // Verify product exists
    const product = await Product.findOne({
      where: {
        id: product_id,
        restaurantId: res_id,
        categoryId: cat_id,
        isActive: true
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get all addons attached to this product
    const addonPerProducts = await AddonPerProduct.findAll({
      where: {
        productId: product_id,
        status: 'active',
        isActive: true
      },
      include: [
        {
          model: Addon,
          as: 'addon',
          where: {
            restaurantId: res_id,
            isActive: true
          },
          attributes: ['id', 'name', 'salePrice']
        }
      ]
    });

    const addons = addonPerProducts.map(app => app.addon);
    return res.status(200).json({
      message: 'Addons fetched successfully',
      addons
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createAddon,
  updateAddon,
  deleteAddon,
  attachAddon,
  detachAddon,
  listMine,
  list
};
