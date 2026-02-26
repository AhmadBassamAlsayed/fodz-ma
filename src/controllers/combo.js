const { Combo, ComboItem, Product, sequelize } = require('../../models');
const { Op } = require('sequelize');
const { getImageUrl, deleteImage } = require('../middleware/imageUpload');

const normalizeProductsPayload = (products) => {
    if (!Array.isArray(products) || products.length === 0) {
        throw new Error('addedProducts must include at least one entry');
    }
    const normalized = [];
    for (const entry of products) {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
            throw new Error('Each product must be an object');
        }
        const productId = Number(entry.productId);
        const quantity = Number(entry.quantity);
        if (!Number.isInteger(productId) || productId <= 0) {
            throw new Error('Invalid product id');
        }
        if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new Error('Invalid product quantity');
        }
        normalized.push({ productId, quantity });
    }
    return normalized;
};

const aggregateProductQuantities = (normalized) => {
    const quantities = new Map();
    normalized.forEach(({ productId, quantity }) => {
        quantities.set(productId, (quantities.get(productId) || 0) + quantity);
    });
    return quantities;
};

const create = async (req, res) => {
    try {
        const { restaurantId, name, price, description } = req.body;
        let { addedProducts, isActive } = req.body;
        
        // Parse addedProducts if it's a string (from multipart/form-data)
        if (typeof addedProducts === 'string') {
            try {
                addedProducts = JSON.parse(addedProducts);
            } catch (parseError) {
                return res.status(400).json({ message: 'Invalid JSON format for addedProducts' });
            }
        }
        
        if(!isActive){
            isActive=false;
        }
        let normalizedProducts;
        try {
            normalizedProducts = normalizeProductsPayload(addedProducts);
        } catch (validationError) {
            return res.status(400).json({ message: validationError.message });
        }
        const productQuantities = aggregateProductQuantities(normalizedProducts);
        const uniqueProductIds = Array.from(productQuantities.keys());
        
        // Authorization check
        if (Number(restaurantId) !== Number(req.user.id)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Validate required fields
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Combo name is required' });
        }        
        if (name.length > 160) {
            return res.status(400).json({ message: 'Combo name must be less than 160 characters' });
        }
        if (description && description.length > 160) {
            return res.status(400).json({ message: 'Description must be less than 160 characters' });
        }        
        // Validate price
        const priceValue = Number(price);
        if (Number.isNaN(priceValue) || priceValue < 0) {
            return res.status(400).json({ message: 'Price must be a non-negative number' });
        }
        // Verify all products exist, belong to the restaurant, and are active
        const products = await Product.findAll({
            where: {
                id: { [Op.in]: uniqueProductIds },
                restaurantId,
                isActive: true,
                isDeleted: false
            }
        });
        
        if (products.length !== uniqueProductIds.length) {
            return res.status(404).json({ message: 'One or more products not found or inactive' });
        }
        // Create combo and combo items in a transaction
        const result = await sequelize.transaction(async (t) => {
            // Create the combo
            const comboData = {
                name,
                description,
                price: priceValue,
                restaurantId,
                status: isActive ? 'active' : 'deactivated',
                isActive,
                createdBy: req.user.name || null,
                updatedBy: req.user.name || null
            };

            // Handle optional photo upload
            if (req.file) {
                comboData.photoUrl = getImageUrl(req.file.filename);
            }

            const combo = await Combo.create(comboData, { transaction: t });
            
            // Create combo items
            const comboItems = uniqueProductIds.map(productId => ({
                comboId: combo.id,
                productId,
                quantity: productQuantities.get(productId),
                status: isActive?'active':'deactivated',
                isActive,
                createdBy: req.user.name || null,
                updatedBy: req.user.name || null
            }));
            
            await ComboItem.bulkCreate(comboItems, { transaction: t });
            
            return combo;
        });
        
        return res.status(201).json({
            message: 'Combo created successfully',
            combo: result
        });
        
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

const update = async (req, res) => {
    try {
        const { restaurantId, name, price, description } = req.body;
        let { addedProducts } = req.body;
        const comboId = req.params.combo_id;
        let isActive = req.body.isActive || false;
        
        // Parse addedProducts if it's a string (from multipart/form-data)
        if (typeof addedProducts === 'string') {
            try {
                addedProducts = JSON.parse(addedProducts);
            } catch (parseError) {
                return res.status(400).json({ message: 'Invalid JSON format for addedProducts' });
            }
        }
        
        let normalizedProducts;
        try {
            normalizedProducts = normalizeProductsPayload(addedProducts);
        } catch (validationError) {
            return res.status(400).json({ message: validationError.message });
        }
        const productQuantities = aggregateProductQuantities(normalizedProducts);
        const uniqueProductIds = Array.from(productQuantities.keys());
        
        // Authorization check
        if (Number(restaurantId) !== Number(req.user.id)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Validate required fields
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Combo name is required' });
        }
        if (name.length > 160) {
            return res.status(400).json({ message: 'Combo name must be less than 160 characters' });
        }
        if (description && description.length > 160) {
            return res.status(400).json({ message: 'Description must be less than 160 characters' });
        }        
        // Validate price
        const priceValue = Number(price);
        if (Number.isNaN(priceValue) || priceValue < 0) {
            return res.status(400).json({ message: 'Price must be a non-negative number' });
        }
        // Find existing combo with all items (including deleted ones)
        const combo = await Combo.findOne({
            where:{
                id: comboId,
                restaurantId,
                isDeleted: false
            },
            include:[
                {
                    model:ComboItem,
                    as:'items',
                    required: false // Include even if no items
                }
            ]
        });
        
        if (!combo) {
            return res.status(404).json({ message: 'Combo not found' });
        }

        // Verify all products exist, belong to the restaurant, and are active
        const products = await Product.findAll({
            where: {
                id: { [Op.in]: uniqueProductIds },
                restaurantId,
                isActive: true,
                isDeleted: false
            }
        });
        
        if (products.length !== uniqueProductIds.length) {
            return res.status(404).json({ message: 'One or more products not found or inactive' });
        }
        const newProductIdsSet = new Set(uniqueProductIds);
        const newProductQuantityMap = new Map(productQuantities);
        
        // Update combo and manage combo items in a transaction
        const result = await sequelize.transaction(async (t) => {
            // Update the combo
            const updateData = {
                name,
                description,
                price: priceValue,
                status: isActive ? 'active' : 'deactivated',
                updatedBy: req.user.name || null
            };

            // Handle optional photo upload
            if (req.file) {
                // Delete old photo if exists
                if (combo.photoUrl) {
                    deleteImage(combo.photoUrl);
                }
                updateData.photoUrl = getImageUrl(req.file.filename);
            }

            await combo.update(updateData, { transaction: t });
            
            // Get all existing combo items (including deleted ones)
            const allExistingItems = await ComboItem.findAll({
                where: { comboId: combo.id },
                transaction: t
            });
            
            // Process each existing item
            for (const existingItem of allExistingItems) {
                if (newProductIdsSet.has(existingItem.productId)) {
                    const targetQuantity = newProductQuantityMap.get(existingItem.productId);
                    await existingItem.update({
                        quantity: targetQuantity,
                        status: isActive ? 'active' : 'deactivated',
                        isActive,
                        updatedBy: req.user.name || null
                    }, { transaction: t });
                    newProductQuantityMap.delete(existingItem.productId);
                } else {
                    // Product is not wanted - hard delete
                    await existingItem.destroy({ transaction: t });
                }
            }
            
            if (newProductQuantityMap.size > 0) {
                const newItems = Array.from(newProductQuantityMap.entries()).map(([productId, quantity]) => ({
                    comboId: combo.id,
                    productId,
                    quantity,
                    status: isActive ? 'active' : 'deactivated',
                    isActive,
                    createdBy: req.user.name || null,
                    updatedBy: req.user.name || null
                }));
                await ComboItem.bulkCreate(newItems, { transaction: t });
            }
            
            return combo;
        });
        
        return res.status(201).json({
            message: 'Combo updated successfully',
            combo: result
        });
        
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

const deletee = async (req,res)=>{
    try {
        const restaurantId= Number(req.params.res_id)
        const comboId= Number(req.params.combo_id)
        const combo = await Combo.findByPk(comboId,{where:{restaurantId}});
        if(!combo){
            return res.status(404).json({message:'Combo not found'})
        }
        await combo.update({isDeleted: true, isActive:false, updatedBy:req.user.name});
        await ComboItem.update({isDeleted: true, isActive:false, updatedBy:req.user.name},{where:{comboId}});

        return res.status(200).json({message:'Combo deleted successfully'})
    } catch (error) {
        res.status(500).json({message:'Server error'})
        console.log(error.message);
        console.log(error);
    }
};

const activate= async (req,res)=>{
    try {
        const restaurantId= Number(req.params.res_id );
        const comboId= Number(req.params.combo_id);

        const combo = await Combo.findOne({
            where:{ id: comboId, restaurantId },
            include:[
                {
                    model: ComboItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['id','name','isActive','status']
                        }
                    ]
                }
            ]
        });

        if(!combo){
            return res.status(404).json({message:'Combo not found'})
        }

        if (!combo.items || combo.items.length === 0) {
            return res.status(400).json({message:'Combo has no products to activate'})
        }

        const hasInactiveProduct = combo.items.some(item => !item.product || item.product.isActive !== true);
        if (hasInactiveProduct) {
            return res.status(400).json({message:'Cannot activate combo while it contains inactive products'})
        }

        await combo.update({status:'active',isActive:true,updatedBy:req.user.name});
        await ComboItem.update({status:'active',isActive:true,updatedBy:req.user.name},{where:{comboId}});
        
        return res.status(200).json({message:'Combo activated successfully'})
    } catch (error) {
        res.status(500).json({message:'Server error'})
        console.log(error.message);
        console.log(error);
    }
};

const deactivate= async (req,res)=>{
    try {
        const restaurantId= Number(req.params.res_id)
        const comboId= Number(req.params.combo_id)
        const combo = await Combo.findByPk(comboId,{where:{restaurantId,isActive:true}});
        if(!combo){
            return res.status(404).json({message:'Combo not found'})
        }
        await combo.update({status:'deactivated',isActive:false,updatedBy:req.user.name});
        await ComboItem.update({status:'deactivated',isActive:false,updatedBy:req.user.name},{where:{comboId}});

        return res.status(200).json({message:'Combo deactivated successfully'})
    } catch (error) {
        res.status(500).json({message:'Server error'})
        console.log(error.message);
        console.log(error);
    }
};

const getMine= async (req,res)=>{
    try {
        const restaurantId= Number(req.params.res_id)
        if(restaurantId!=req.user.restaurantId){
            return res.status(403).json({message:'Unauthorized'})
        }
        const combos = await Combo.findAll({where:{restaurantId, isDeleted: false}})
        const jsonCombos=combos.map(combo=>combo.toJSON())
        jsonCombos.forEach(combo=>{
            combo.photoUrl = combo.photoUrl || null
        })
        return res.status(200).json({combos:jsonCombos})
    } catch (error) {
        res.status(500).json({message:'Server error'})
        console.log(error.message);
        console.log(error);
    }
};

const Detail= async (req,res)=>{
    try {
        const restaurantId= Number(req.params.res_id)
        const comboId= Number(req.params.combo_id)
        let combo=null
        if(req.user && req.user.role === 'restaurant'){
            if(req.user.id!=restaurantId){
                return res.status(403).json({message:'Unauthorized'})
            }    
            combo = await Combo.findOne({ where: { id: comboId, restaurantId, isDeleted: false},include:[
                {
                    model:ComboItem,
                    as:'items',
                    attributes:[['id','itemId'],'quantity'],
                    include:[
                        {
                            model:Product,
                            as:'product',
                            attributes:[['id','productId'],'name','isActive','status','salePrice']
                        }
                    ]
                }
            ]});
        } else {
            combo = await Combo.findOne({ where: { id: comboId, restaurantId,isActive:true,status:'active' },include:[
                {
                    model:ComboItem,
                    as:'items',
                    attributes:[['id','itemId'],'quantity'],
                    include:[
                        {
                            model:Product,
                            as:'product',
                            attributes:[['id','productId'],'name','isActive','status','salePrice']
                        }
                    ]
                }
            ]});
        }
        if(!combo){
            return res.status(404).json({message:'Combo not found'})
        }

        const comboJson = combo.toJSON();
        comboJson.photoUrl = combo.photoUrl || null;
        comboJson.items.forEach(item=>{
            item.product.photoUrl = item.product.photoUrl || null
        })

        return res.status(200).json({combo: comboJson})
    } catch (error) {
        res.status(500).json({message:'Server error'})
        console.log(error.message);
        console.log(error);
    }
};

const getCombo= async (req,res)=>{
    try {
        const restaurantId= Number(req.params.res_id)
        const combos = await Combo.findAll({
            where:{
                restaurantId,
                isActive:true,
                status:'active'
            }
        })
        const jsonCombos=combos.map(combo=>combo.toJSON())
        jsonCombos.forEach(combo=>{
            combo.photoUrl = combo.photoUrl || null
        })
        return res.status(200).json({combos:jsonCombos})
    } catch (error) {
        res.status(500).json({message:'Server error'})
        console.log(error.message);
        console.log(error);
    }
};

module.exports={
    create,
    update,
    deletee,
    activate,
    deactivate,
    getMine,
    Detail,
    getCombo
}