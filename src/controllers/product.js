const { Product, Category, AddonPerProduct, Addon, Combo, ComboItem, Offer, sequelize, Favorite, Rate } = require('../../models');
const { Op, DOUBLE } = require('sequelize');
const { getImageUrl, deleteImage } = require('../middleware/imageUpload');

const resolveRestaurantId = (req) => {
  const {restaurantId} = req.body 
  return restaurantId;
};
// checked
const createProduct = async (req, res) => {
  try {
    const restaurantId = resolveRestaurantId(req);
    if (Number(restaurantId) !== Number(req.user.id)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const categoryId = Number(req.params.cat_id);

    if (!Number.isInteger(categoryId)) {
      return res.status(400).json({ message: 'Invalid category identifier' });
    }

    const category = await Category.findOne({ where: { id: categoryId, restaurantId, isDeleted: false} });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const {
      name,
      description,
      salePrice,
      prepTimeMinutes,
      addons,
      forSale
    } = req.body;

    let addonIds = [];
    if (addons !== undefined && addons !== null && addons !== '') {
      let addonArray;
      
      // Handle both array and comma-separated string formats
      if (Array.isArray(addons)) {
        addonArray = addons;
      } else if (typeof addons === 'string') {
        addonArray = addons.split(',').map(id => id.trim()).filter(id => id !== '');
      } else {
        return res.status(400).json({ message: 'Addons must be an array or comma-separated string' });
      }

      if (addonArray.length > 0) {
        const parsedIds = addonArray.map((addonId) => Number(addonId));
        const invalidAddonIds = parsedIds.filter((addonId) => !Number.isInteger(addonId) || addonId <= 0);

        if (invalidAddonIds.length > 0) {
          return res.status(400).json({ message: 'Addon identifiers must be positive integers' });
        }

        addonIds = Array.from(new Set(parsedIds));
      }
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Product name is required' });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Product description is required' });
    }

    const salePriceValue = Number(salePrice);
    if (Number.isNaN(salePriceValue) || salePriceValue < 0) {
      return res.status(400).json({ message: 'Sale price must be a non-negative number' });
    }

    const prepTimeValue =
      prepTimeMinutes !== undefined && prepTimeMinutes !== null && prepTimeMinutes !== ''
        ? Number(prepTimeMinutes)
        : null;
    if (prepTimeValue !== null && (!Number.isInteger(prepTimeValue) || prepTimeValue < 0)) {
      return res.status(400).json({ message: 'Preparation time must be a non-negative integer' });
    }

    let createdProduct;

    try {
      await sequelize.transaction(async (transaction) => {
        const productData = {
          name: name.trim(),
          description: description.trim(),
          salePrice: salePriceValue,
          prepTimeMinutes: prepTimeValue,
          categoryId,
          restaurantId,
          status: category.status,
          isActive: category.isActive,
          forSale,
          createdBy: req.user.name,
          updatedBy: req.user.name
        };

        // Handle optional photo upload
        if (req.file) {
          productData.photoUrl = getImageUrl(req.file.filename);
        }

        const product = await Product.create(productData, { transaction });

        createdProduct = product;

        if (addonIds.length > 0) {
          const restaurantAddons = await Addon.findAll({
            where: {
              id: addonIds,
              restaurantId,
              status: { [Op.ne]: 'deleted' },
              isActive: true
            },
            transaction
          });

          if (restaurantAddons.length !== addonIds.length) {
            const existingAddonIds = new Set(restaurantAddons.map((addon) => addon.id));
            const missingAddonIds = addonIds.filter((addonId) => !existingAddonIds.has(addonId));

            const error = new Error('One or more addons were not found for this restaurant');
            error.statusCode = 404;
            error.details = { missingAddonIds };
            throw error;
          }

          const addonPerProductPayload = addonIds.map((addonId) => ({
            productId: product.id,
            addonId,
            status: 'active',
            isActive: true,
            createdBy: req.user.name,
            updatedBy: req.user.name
          }));

          await AddonPerProduct.bulkCreate(addonPerProductPayload, { transaction });
        }
      });
    } catch (transactionError) {
      if (transactionError.statusCode) {
        throw transactionError;
      }
      const error = new Error('Failed to create product');
      error.statusCode = 500;
      error.details = { cause: transactionError.message };
      throw error;
    }

    return res.status(201).json({
      message: 'Product created successfully',
      product:createdProduct
    });
  } catch (error) {
    console.error(error);
    if (error.statusCode) {
      const responseBody = {
        message: error.message
      };

      if (error.details) {
        Object.assign(responseBody, error.details);
      }

      return res.status(error.statusCode).json(responseBody);
    }

    return res.status(500).json({ message: 'Server error' });
  }
};
// checked
const list = async (req, res) => {
  try {
    let {res_id,cat_id} = req.params;
    res_id = Number(res_id);
    cat_id = Number(cat_id);
    let customer_id;
    let whereClause = {
      status:'active',
      isActive:true
    };
    if(req.user){
      customer_id = req.user.id;
      whereClause.customerId = customer_id;
    }
    if (!Number.isInteger(res_id)) {
      return res.status(400).json({ message: 'Invalid restaurant identifier' });
    }
    if (!Number.isInteger(cat_id)) {
      return res.status(400).json({ message: 'Invalid category identifier' });
    }
    
    let products 
    const currentDate = new Date();
    if(cat_id>0){
      products = await Product.findAll({ 
        where: { 
          restaurantId:res_id, 
          categoryId:cat_id,
          isActive:true,
          status:'active'
        },attributes:[
          'id',
          'name',
          'description',
          'salePrice',
          'prepTimeMinutes',
          'photoUrl',
          [sequelize.fn('AVG', sequelize.col('rates.rating')), 'averageRating'],
          [sequelize.fn('COUNT', sequelize.col('rates.id')), 'ratingCount']
        ],
        include:[{
            model:Rate,
            as:'rates',
            attributes:[],
            required:false,
            where:{
              productId: { [Op.ne]: null }
            }
          },{
            model:Offer,
            as:'offers',
            required: false,
            where:{
              isPleassing:false,
              status:'active',
              isActive:true,
              [Op.or]: [
                { startDate: null },
                { startDate: { [Op.lte]: currentDate } }
              ],
              [Op.or]: [
                { endDate: null },
                { endDate: { [Op.gte]: currentDate } }
              ]
            }
          },{
            model:Favorite,
            as:'favorites',
            required:false,
            where:whereClause
          },{
            model:Category,
            as:'category',
            required:true,
            where:{
              isActive:true,
              status:'active'
            }
          }
        ],
        group: ['Product.id', 'offers.id', 'favorites.id', 'category.id'],
        subQuery: false
      })
    }else if(cat_id==0){
      products = await Product.findAll({ 
        where: { 
          restaurantId:res_id, 
          isActive:true,
          status:'active' 
        },
        attributes:[
          'id',
          'name',
          'categoryId',
          'description',
          'salePrice',
          'prepTimeMinutes',
          'photoUrl',
          [sequelize.fn('AVG', sequelize.col('rates.rating')), 'averageRating'],
          [sequelize.fn('COUNT', sequelize.col('rates.id')), 'ratingCount']
        ],
        include:[{
            model:Rate,
            as:'rates',
            attributes:[],
            required:false,
            where:{
              productId: { [Op.ne]: null }
            }
          },{
            model:Offer,
            required: false,
            as:'offers',
            where:{
              isPleassing: false,
              status:'active',
              isActive:true,
              [Op.or]: [
                { startDate: null },
                { startDate: { [Op.lte]: currentDate } }
              ],
              [Op.or]: [
                { endDate: null },
                { endDate: { [Op.gte]: currentDate } }
              ]
            }
          },{
            model:Favorite,
            as:'favorites',
            required:false,
            where:whereClause
          },{
            model:Category,
            as:'category',
            attributes:['id','name','shortName'],
            required:true,
            where:{
              isActive:true,
              status:'active'
            }
          }
        ],
        group: ['Product.id', 'offers.id', 'favorites.id', 'category.id'],
        subQuery: false
      })
    };
    if (products.length === 0) {
      return res.status(404).json({ message: 'Products not found' });
    }
    const productjson = products.map((product) => product.toJSON());
    productjson.forEach((product) => {
      if(product.favorites.length>0){
        product.isFavorite=true;
      }else{
        product.isFavorite=false;
      }
      delete product.favorites;
      product.photoUrl = product.photoUrl || null;
      product.averageRating = product.averageRating ? parseFloat(product.averageRating).toFixed(2) : null;
      product.ratingCount = product.ratingCount ? parseInt(product.ratingCount) : 0;
    });
    
    return res.status(200).json({
      message: 'Products fetched successfully',
      data:productjson
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
// checked
const detail = async (req, res) => {
  try {
    let plessThing = Boolean(req.query.pless==='true');
    let {res_id,cat_id,product_id} = req.params;
    res_id = Number(res_id);
    cat_id = Number(cat_id);
    product_id = Number(product_id);
    console.log(plessThing);
    
    if (!Number.isInteger(product_id)) {
      return res.status(400).json({ message: 'Invalid product identifier' });
    }
    if (!Number.isInteger(res_id)) {
      return res.status(400).json({ message: 'Invalid restaurant identifier' });
    }
    if (!Number.isInteger(cat_id)) {
      return res.status(400).json({ message: 'Invalid category identifier' });
    }

    const currentDate = new Date();
    const product = await Product.findOne({ 
      where: { 
        id: product_id, 
        restaurantId:res_id, 
        categoryId:cat_id,
        isActive:true,
      },
      attributes: [
        'id',
        'name',
        'description',
        'salePrice',
        'prepTimeMinutes',
        'photoUrl',
        'categoryId',
        'restaurantId',
        'status',
        'isActive',
        [sequelize.fn('AVG', sequelize.col('rates.rating')), 'averageRating'],
        [sequelize.fn('COUNT', sequelize.col('rates.id')), 'ratingsCount']
      ],
      include:[
          {
            model: AddonPerProduct,
            as: 'productAddons',
            required: false,
            attributes: ['id', 'addonId', 'isActive', 'status'],
            where: {
              status: { [Op.ne]: 'deleted' }
            },
            include: [
              {
                model: Addon,
                as: 'addon',
                attributes: ['id', 'name', 'salePrice']
              }
            ]
          },{
            model:Offer,
            required: false,
            as:'offers',
            where:{
              isPleassing:plessThing,
              status:'active',
              isActive:true,
              [Op.or]: [
                { startDate: null },
                { startDate: { [Op.lte]: currentDate } }
              ],
              [Op.or]: [
                { endDate: null },
                { endDate: { [Op.gte]: currentDate } }
              ]
            }
          },{
            model: Rate,
            as: 'rates',
            attributes: [],
            required: false,
            where: {
              productId: { [Op.ne]: null }
            }
          }
        ],
        group: ['Product.id', 'productAddons.id', 'productAddons->addon.id', 'offers.id'],
        subQuery: false
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const productDetails = product.toJSON();
    productDetails.photoUrl = productDetails.photoUrl || null;
    productDetails.averageRating = productDetails.averageRating ? parseFloat(productDetails.averageRating).toFixed(2) : null;
    productDetails.ratingsCount = productDetails.ratingsCount ? parseInt(productDetails.ratingsCount) : 0;
    
    productDetails.productAddons.forEach(element => {
      element.addon.photoUrl = null
    });
    
    // Check if user has favorited this product
    productDetails.isFav = false;
    if (req.user && req.user.customerId) {
      const favorite = await Favorite.findOne({
        where: {
          customerId: req.user.customerId,
          productId: product_id,
          isActive: true,
          status: 'active'
        }
      });
      productDetails.isFav = !!favorite;
    }

    return res.status(200).json({
      message: 'Product fetched successfully',
      Data: productDetails
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
// checked and updated
const getMine = async (req, res) => {
  try {
    const restaurantId = Number(req.params.res_id);
    const categoryId=Number(req.params.cat_id);
    if (restaurantId !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    let products;
    if(categoryId===0){
      console.log('all products');
      
      const currentDate = new Date();
      products = await Product.findAll({
        where: {
          restaurantId,
          isDeleted: false
        },
        include: [
          {
            model: AddonPerProduct,
            as: 'productAddons',
            required: false,
            attributes: ['id', 'addonId', 'isActive', 'status'],
            where: {
              isDeleted: false
            },
            include: [
              {
                model: Addon,
                as: 'addon',
                attributes: ['id', 'name', 'salePrice']
              }
            ]
          },{
            model:Offer,
            as:'offers',
            required:false,
            where:{
              isPleassing: false,
              status:'active',
              isActive:true,
              [Op.or]: [
                { startDate: null },
                { startDate: { [Op.lte]: currentDate } }
              ],
              [Op.or]: [
                { endDate: null },
                { endDate: { [Op.gte]: currentDate } }
              ]
            }
          },{
            model:Offer,
            as:'plessingOffers',
            required:false,
            where:{
              isPleassing: true,
              isActive:true,
              isDeleted:false,
              endDate: { [Op.gte]: currentDate }
            }
          }
        ]
      });
    }else{
      console.log('category products');
      const currentDate = new Date();
      products = await Product.findAll({
        where: {
          restaurantId,
          categoryId,
          isDeleted: false
        },
        include: [
          {
            model: AddonPerProduct,
            as: 'productAddons',
            required: false,
            attributes: ['id', 'addonId', 'isActive', 'status'],
            where: {
              isDeleted: false
            },
            include: [
              {
                model: Addon,
                as: 'addon',
                required: false,
                attributes: ['id', 'name', 'salePrice']
              }
            ]
          },{
            model:Offer,
            required: false,
            as:'offers',
            where:{
              isPleassing: false,
              status:'active',
              isActive:true,
              [Op.or]: [
                { startDate: null },
                { startDate: { [Op.lte]: currentDate } }
              ],
              [Op.or]: [
                { endDate: null },
                { endDate: { [Op.gte]: currentDate } }
              ]
            }
          },{
            model:Offer,
            as:'plessingOffers',
            required:false,
            where:{
              isPleassing: true,
              isActive:true,
              isDeleted:false,
              endDate: { [Op.gte]: currentDate }
            }
          }
        ]
      });
    }

    if (products.length === 0) {
      return res.status(404).json({ message: 'Products not found' });
    }

    // Get all product IDs to check if they're in active combos
    const productIds = products.map(p => p.id);
    
    // Find all active combo items for these products
    const activeComboItems = await ComboItem.findAll({
      where: {
        productId: productIds,
        isDeleted: false,
        isActive: true
      },
      include: [{
        model: Combo,
        as: 'combo',
        where: {
          isDeleted: false,
          isActive: true,
          status: 'active'
        },
        attributes: ['id']
      }],
      attributes: ['productId']
    });

    // Create a Set of product IDs that are in active combos
    const productsInCombos = new Set(activeComboItems.map(item => item.productId));

    const serializedProducts = products.map((product) => {
      const productJson = product.toJSON();
      productJson.photoUrl = productJson.photoUrl || null
      
      productJson.addons = (productJson.productAddons || [])
        .filter((productAddon) => productAddon.addon)
        .map((productAddon) => ({
          id: productAddon.addon.id,
          name: productAddon.addon.name,
          salePrice: productAddon.addon.salePrice,
          photoUrl: null
        }));
        delete productJson.productAddons;
      
      // Add inCombo flag
      productJson.inCombo = productsInCombos.has(product.id);
      
      return productJson;
    });

    return res.status(200).json({
      message: 'Products fetched successfully',
      products: serializedProducts
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
//checked 
const getMineDeleted= async (req, res) => {
  try {
    const restaurantId = Number(req.params.res_id);
    const categoryId=Number(req.params.cat_id);
    if (restaurantId !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const products = await Product.findAll({ 
      where:{
        restaurantId,
        categoryId,
        isDeleted: true
      }
    });
    if (products.length === 0) {
      return res.status(404).json({ message: 'Products not found' });
    }
    const productsjson = products.map((product) => product.toJSON());
    productsjson.forEach(product => {
        product.photoUrl = product.photoUrl || null
    });        

    return res.status(200).json({
      message: 'Products fetched successfully',
      products:productsjson
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
// checked and updated
const updateProduct = async (req, res) => {
  try {
    const productId = Number(req.params.product_id);
    const {
      name,
      description,
      salePrice,
      prepTimeMinutes,
      addons
    } = req.body;

    const restaurantId = resolveRestaurantId(req);
    
    if (Number(restaurantId) !== Number(req.user.id)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!Number.isInteger(productId)) {
      return res.status(400).json({ message: 'Invalid product identifier' });
    }
    const product = await Product.findOne({ where: { id: productId, restaurantId, isDeleted: false} });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let addonIds = [];
    if (addons !== undefined && addons !== null && addons !== '') {
      let addonArray;
      
      // Handle both array and comma-separated string formats
      if (Array.isArray(addons)) {
        addonArray = addons;
      } else if (typeof addons === 'string') {
        addonArray = addons.split(',').map(id => id.trim()).filter(id => id !== '');
      } else {
        return res.status(400).json({ message: 'Addons must be an array or comma-separated string' });
      }

      if (addonArray.length > 0) {
        const parsedIds = addonArray.map((addonId) => Number(addonId));
        const invalidAddonIds = parsedIds.filter((addonId) => !Number.isInteger(addonId) || addonId <= 0);

        if (invalidAddonIds.length > 0) {
          return res.status(400).json({ message: 'Addon identifiers must be positive integers' });
        }

        addonIds = Array.from(new Set(parsedIds));
      }
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Product name is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Product description is required' });
    }
    const salePriceValue = Number(salePrice);
    if (Number.isNaN(salePriceValue) || salePriceValue < 0) {
      return res.status(400).json({ message: 'Sale price must be a non-negative number' });
    }

    const prepTimeValue =
      prepTimeMinutes !== undefined && prepTimeMinutes !== null && prepTimeMinutes !== ''
        ? Number(prepTimeMinutes)
        : null;
    if (prepTimeValue !== null && (!Number.isInteger(prepTimeValue) || prepTimeValue < 0)) {
      return res.status(400).json({ message: 'Preparation time must be a non-negative integer' });
    }

    await sequelize.transaction(async (transaction) => {
      const updateData = {
        name: name.trim(),
        description: description.trim(),
        salePrice: salePriceValue,
        prepTimeMinutes: prepTimeValue,
        updatedBy: req.user.name
      };

      // Handle optional photo upload
      if (req.file) {
        // Delete old photo if exists
        if (product.photoUrl) {
          deleteImage(product.photoUrl);
        }
        updateData.photoUrl = getImageUrl(req.file.filename);
      }

      await product.update(updateData, { transaction });

      // Handle addon updates if provided
      if (Array.isArray(addons)) {
        // Validate all addon IDs belong to the restaurant
        if (addonIds.length > 0) {
          const restaurantAddons = await Addon.findAll({
            where: {
              id: addonIds,
              restaurantId,
              isDeleted: false,
              isActive: true
            },
            transaction
          });

          if (restaurantAddons.length !== addonIds.length) {
            const existingAddonIds = new Set(restaurantAddons.map((addon) => addon.id));
            const missingAddonIds = addonIds.filter((addonId) => !existingAddonIds.has(addonId));

            const error = new Error('One or more addons were not found for this restaurant');
            error.statusCode = 404;
            error.details = { missingAddonIds };
            throw error;
          }
        }

        // Get current addon attachments
        const currentAttachments = await AddonPerProduct.findAll({
          where: { productId },
          transaction
        });

        const currentAddonIds = new Set(currentAttachments.map((att) => att.addonId));
        const newAddonIdsSet = new Set(addonIds);

        // Find addons to remove (in current but not in new)
        const addonsToRemove = currentAttachments.filter(
          (att) => !newAddonIdsSet.has(att.addonId)
        );

        // Find addons to add (in new but not in current)
        const addonsToAdd = addonIds.filter((addonId) => !currentAddonIds.has(addonId));

        // Remove obsolete attachments
        if (addonsToRemove.length > 0) {
          await AddonPerProduct.destroy({
            where: {
              id: addonsToRemove.map((att) => att.id)
            },
            transaction
          });
        }

        // Add new attachments
        if (addonsToAdd.length > 0) {
          const addonPerProductPayload = addonsToAdd.map((addonId) => ({
            productId: product.id,
            addonId,
            status: 'active',
            isActive: true,
            createdBy: req.user.name,
            updatedBy: req.user.name
          }));

          await AddonPerProduct.bulkCreate(addonPerProductPayload, { transaction });
        }
      }
    });

    return res.status(200).json({
      message: 'Product updated successfully',
    });
  } catch (error) {
    console.error(error);
    if (error.statusCode) {
      const responseBody = {
        message: error.message
      };

      if (error.details) {
        Object.assign(responseBody, error.details);
      }

      return res.status(error.statusCode).json(responseBody);
    }

    return res.status(500).json({ message: 'Server error' });
  }
};
// checked
const deleteProduct = async (req, res) => {
  try {
    const productId = Number(req.params.product_id);
    const restaurantId = resolveRestaurantId(req);
    
    if (restaurantId !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!Number.isInteger(productId)) {
      return res.status(400).json({ message: 'Invalid product identifier' });
    }
    const product = await Product.findOne({ where: { id: productId, restaurantId, isDeleted: false} });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is part of any active combo
    const activeComboItems = await ComboItem.findAll({
      where: {
        productId,
        isDeleted: false
      },
      include: [{
        model: Combo,
        as: 'combo',
        where: {
          isDeleted: false
        }
      }]
    });

    

    if (activeComboItems.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete product that is part of an active combo. Please remove it from combos first or set forSale to false.' 
      });
    }

    const updatedBy = req.user.name || null;

    await sequelize.transaction(async (transaction) => {
      await product.update({
        isDeleted: true,
        isActive: false,
        updatedBy
      }, { transaction });

      await Offer.update({
        isDeleted: true,
        isActive: false,
        updatedBy
      }, {
        where: {
          productId,
          isDeleted: false
        },
        transaction
      });
    });
    return res.status(200).json({
      message: 'Product deleted successfully',
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
// checked
const restoreProduct = async (req, res) =>{
  try {
    const productId = Number(req.params.product_id);
    const restaurantId = resolveRestaurantId(req);
    
    if (restaurantId !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!Number.isInteger(productId)) {
      return res.status(400).json({ message: 'Invalid product identifier' });
    }
    const product = await Product.findOne({ where: { id: productId, restaurantId, isDeleted: true} });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await product.update({
      status:'active',
      isActive: true,
      updatedBy: req.user.name
    });
    return res.status(200).json({
      message: 'Product restored successfully',
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
// checked
const deactivateProduct = async (req, res) => {
  try {
    const productId = Number(req.params.product_id);
    const restaurantId = resolveRestaurantId(req);
    
    if (restaurantId !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!Number.isInteger(productId)) {
      return res.status(400).json({ message: 'Invalid product identifier' });
    }
    const product = await Product.findOne({ where: { id: productId, restaurantId, isDeleted: false} });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await product.update({
      status:'deactivated',
      isActive: false,
      updatedBy: req.user.name
    });

    // Deactivate all offers linked to this product
    await Offer.update(
      {
        status: 'deactivated',
        isActive: false,
        updatedBy: req.user.name
      },
      {
        where: {
          productId: productId,
          isDeleted: false
        }
      }
    );

    // Find all combos that contain this product
    const comboItems = await ComboItem.findAll({
      where: { productId: productId },
      attributes: ['comboId']
    });

    if (comboItems.length > 0) {
      const comboIds = [...new Set(comboItems.map(item => item.comboId))];
      
      // Deactivate all combos that contain this product
      await Combo.update(
        {
          status: 'deactivated',
          isActive: false,
          updatedBy: req.user.name
        },
        {
          where: {
            id: comboIds,
            isDeleted: false
          }
        }
      );
    }

    return res.status(200).json({
      message: 'Product deactivated successfully',
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
// checked
const activateProduct = async (req, res) => {
  try {
    const productId = Number(req.params.product_id);
    const restaurantId = resolveRestaurantId(req);
    
    if (restaurantId !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!Number.isInteger(productId)) {
      return res.status(400).json({ message: 'Invalid product identifier' });
    }
    const product = await Product.findOne({ where: { id: productId, restaurantId,status:'deactivated',isActive:false } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await product.update({
      status:'active',
      isActive: true,
      updatedBy: req.user.name
    });

    return res.status(200).json({
      message: 'Product activated successfully',
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const hideProduct = async (req, res) => {
    try {
      const productId = Number(req.params.product_id);
      const restaurantId = resolveRestaurantId(req);
      
      if (restaurantId !== req.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      if (!Number.isInteger(productId)) {
        return res.status(400).json({ message: 'Invalid product identifier' });
      }
      const product = await Product.findOne({ where: { id: productId, restaurantId, isDeleted: false} });
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      await product.update({
        status:'hidden',
        isActive: true,
        forSale:false,
        updatedBy: req.user.name
      });

      return res.status(200).json({
          message: 'Product hidden successfully',
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
}

const unhideProduct = async (req, res) => {
    try {
      const productId = Number(req.params.product_id);
      const restaurantId = resolveRestaurantId(req);
      
      if (restaurantId !== req.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      if (!Number.isInteger(productId)) {
        return res.status(400).json({ message: 'Invalid product identifier' });
      }
      const product = await Product.findOne({ where: { id: productId, restaurantId, isDeleted: false} });
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      await product.update({
        status:'active',
        isActive: true,
        forSale:true,
        updatedBy: req.user.name
      });

      return res.status(200).json({
          message: 'Product unhidden successfully',
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
}

module.exports = {
  list,
  detail,
  getMine,
  getMineDeleted,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  deactivateProduct,
  activateProduct,
  hideProduct,
  unhideProduct
};
